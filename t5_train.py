import json
from tqdm import tqdm
import numpy as np
import os
import random
from matplotlib import pyplot as plt

import torch
from torch.utils.data import TensorDataset, DataLoader
from transformers import T5Tokenizer, T5ForConditionalGeneration
from transformers import AdamW, get_linear_schedule_with_warmup

EPOCHS = 4
BATCH_SIZE = 8
ACCUM_STEPS = 2
LRATE = 1e-3
WARMUP = 0.1
SEED = 123
MODEL_OUTPUT_FOLDER = 'models/'
OUTPUT_NAME = 't5qg_512_128_e4b8a2_lr1e-3_wu0.1'

torch.manual_seed(SEED)
torch.cuda.manual_seed(SEED)
torch.backends.cudnn.deterministic = True
torch.backends.cudnn.benchmark = False
np.random.seed(SEED)
random.seed(SEED)


tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('t5-small')

device = torch.device('cuda')
model = model.to(device)

dataset = []

with open('SQuAD2.0/train-v2.0.json', 'r') as f:
    data = json.load(f)

    for article in tqdm(data['data']):
        for paragraph in article['paragraphs']:
            context = paragraph['context']
            for qas in paragraph['qas']:
                if qas['answers'] == []:
                    continue
                item = {}
                item['question'] = qas['question']
                item['answer'] = qas['answers'][0]['text']
                item['context'] = context
                dataset.append(item)
                
all_input_ids = []
all_attention_mask = []
all_label_ids = []

for data in tqdm(dataset):
    text = 'answer: {}. context: {}'.format(data['answer'], data['context'])
    encoded = tokenizer.encode_plus(text, max_length=512, pad_to_max_length=True)
    all_input_ids.append(encoded['input_ids'])
    all_attention_mask.append(encoded['attention_mask'])
    
    label_ids = tokenizer.encode(data['question'], max_length=128, pad_to_max_length=True)
    all_label_ids.append(label_ids)
            
tensor_dataset = TensorDataset(torch.tensor(all_input_ids),
                               torch.tensor(all_attention_mask),
                               torch.tensor(all_label_ids))

optimizer = AdamW(model.parameters(), lr=LRATE)

num_training_steps = int(EPOCHS * len(dataset) / BATCH_SIZE / ACCUM_STEPS)
num_warmup_steps = None

if WARMUP > 1:
    num_warmup_steps = WARMUP
else:
    num_warmup_steps = int(num_training_steps * WARMUP)

scheduler = get_linear_schedule_with_warmup(
        optimizer, num_warmup_steps=num_warmup_steps, num_training_steps=num_training_steps)
    
dataloader = DataLoader(tensor_dataset, batch_size=BATCH_SIZE)
model.zero_grad()
model.train()

loss_history = []
mean_loss_hisroty = []
mean_loss = 0

print('\nStart Training')
for epoch in range(EPOCHS):
    tqdm_dataloader = tqdm(dataloader)
    for step, (input_ids, attention_mask, label_ids) in enumerate(tqdm_dataloader):
        outputs = model(input_ids=input_ids.to(device), 
                        attention_mask=attention_mask.to(device),
                        lm_labels=label_ids.to(device))
        loss, prediction_scores = outputs[:2]
        
        loss_history.append(loss.item())
        mean_loss = (mean_loss*(len(loss_history)-1) + loss.item())/len(loss_history)
        mean_loss_hisroty.append(mean_loss)
        tqdm_dataloader.set_postfix(loss=loss.item(), mean_loss=mean_loss)
        
        if ACCUM_STEPS > 1:
            loss = loss / ACCUM_STEPS
        loss.backward()
            
        if (step + 1) % ACCUM_STEPS == 0:
            optimizer.step()
            if WARMUP != False:
                scheduler.step()
            model.zero_grad()

os.system('cd "' + MODEL_OUTPUT_FOLDER + '" && mkdir ' + OUTPUT_NAME)
model.save_pretrained(MODEL_OUTPUT_FOLDER + OUTPUT_NAME)

# plot the graph
plt.figure(figsize=(10,6))
plt.plot(range(len(loss_history)), loss_history, label='Loss')
plt.plot(range(len(mean_loss_hisroty)), mean_loss_hisroty, label='Mean Loss')
plt.legend(loc='best')
plt.ylabel('Loss / Mean'); plt.xlabel('Batch')
for i in range(EPOCHS):
    total = len(mean_loss_hisroty)
    idx = int((i+1)*total/EPOCHS)-1
    plt.plot([idx], [mean_loss_hisroty[idx]], marker='x')
    plt.annotate('%0.4f' % mean_loss_hisroty[idx], xy=(idx, mean_loss_hisroty[idx]+1), ha='center')

plt.savefig(MODEL_OUTPUT_FOLDER + OUTPUT_NAME + '/training_loss.png')
plt.show()

print('\nModel saved to ' + MODEL_OUTPUT_FOLDER + OUTPUT_NAME)

"""

import torch
from transformers import T5Tokenizer, T5ForConditionalGeneration

tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('models/t5qg_512_128_e4b8a2_lr1e-3_wu0.1')
model.eval()

answer = ""
context = ""
input_ids = tokenizer.encode("answer: {}. context: {}".format(answer, context), return_tensors="pt")
with torch.no_grad():
    outputs = model.generate(input_ids, max_length=40, num_beams=2)
tokenizer.decode(outputs[0])

"""