# -*- coding: UTF-8 -*-
import torch
import spacy
from pattern.en import lexeme
from nltk.corpus import stopwords
from transformers import T5Tokenizer, T5ForConditionalGeneration

# if torch.cuda.is_available():
#     device = torch.device('cuda')
# else:
#     device = torch.device('cpu')
device = torch.device('cpu')
tokenizer = T5Tokenizer.from_pretrained('t5-small')
model = T5ForConditionalGeneration.from_pretrained('models/t5qg_512_128_e4b8a2_lr1e-3_wu0.1')
model = model.to(device)
model.eval()

# bug of pattern.en in python>3.6
try:
    lexeme('test')
except:
    pass

stop_words = set(stopwords.words('english'))

nlp = spacy.load("en_core_web_sm")

def custom_question(answer, context):
    input_ids = tokenizer.encode('answer: {}. context: {}'.format(answer, context), return_tensors='pt')
    with torch.no_grad():
        outputs = model.generate(input_ids.to(device), max_length=40, num_beams=2)
    return tokenizer.decode(outputs[0])

def generate_grammar_questions(text):
    results = []
    doc = nlp(text)
    
    for sent in doc.sents:
        s = sent.text.replace('\n', '')
        a = ''
        
        for token in sent:
            if token.tag_.startswith('VB') and a == '' and token.lemma_ not in ['be', 'do'] and not s.startswith(token.text):
                a = token.text
                break
        
        if a == '':
            continue
        
        q = s.replace(a, '______')
        distractors = lexeme(a)
        try:
            distractors.remove(a)
        except:
            pass
        
        item = dict()
        item['question'] = q
        item['answer'] = a
        item['distractors'] = distractors
        results.append(item)
    
    return results

def mark_answers(text):
    def nth_replace(s, sub, repl, n):
        find = s.find(sub)
        i = find != -1
        while find != -1 and i != n:
            find = s.find(sub, find + 1)
            i += 1
        if i == n:
            return s[:find] + repl + s[find+len(sub):]
        return s


    pt = text
    doc = nlp(text)
    
    for i, sent in enumerate(doc.sents):
        s = sent.text.replace('\n', '')
        if s.endswith('?'):
            continue
        
        ps = s
        prev_sent = next_sent = ''
        
        if i != 0:
            prev_sent = list(doc.sents)[i-1].text.replace('\n', '')
        
        if i != len(list(doc.sents))-1:
            next_sent = list(doc.sents)[i+1].text.replace('\n', '')
        
        count = dict()
        for i, ent in enumerate(sent.ents):
            if i > 0:
                if ent.start_char - sent.ents[i-1].end_char < 7:
                    middle_text = doc.text[sent.ents[i-1].end_char:ent.start_char]
                    if middle_text in ['-', '–', ', ', ' and ', ', and ']:
                        continue
            if i < len(sent.ents)-1:
                if sent.ents[i+1].start_char - ent.end_char < 7:
                    middle_text = doc.text[ent.end_char:sent.ents[i+1].start_char]
                    if middle_text in ['-', '–', ', ', ' and ', ', and ']:
                        continue
            if ent.text in count:
                count[ent.text] = count[ent.text]+1
            else:
                count[ent.text] = 1
            ps = nth_replace(ps, ent.text, '<ans>' + ent.text + '</ans>', count[ent.text])
        pt = pt.replace(s, ps)
    return pt

def generate_wh_questions(processed_text):
    all_ans = []
    while processed_text.find('<ans>') != -1:
        start = processed_text.find('<ans>') + 5
        end = processed_text.find('</ans>')
        ans = processed_text[start:end]
        all_ans.append(ans)
        processed_text = processed_text.replace('<ans>', '', 1)
        processed_text = processed_text.replace('</ans>', '', 1)
    
    results = []
    doc = nlp(processed_text)
        
    for i, sent in enumerate(doc.sents):
        s = sent.text.replace('\n', '')
        if s.endswith('?'):
            continue
        
        ans = []
        while len(all_ans) > 0 and all_ans[0] in sent.text:
            ans.append(all_ans[0])
            all_ans = all_ans[1:]
        
        prev_sent = next_sent = ''
        if i != 0:
            prev_sent = list(doc.sents)[i-1].text.replace('\n', '')
        
        if i != len(list(doc.sents))-1:
            next_sent = list(doc.sents)[i+1].text.replace('\n', '')
                        
        for a in ans:
            context = s
            if a not in prev_sent:
                context = prev_sent + ' ' + context
            if a not in next_sent:
                context = context + ' ' + next_sent
            
            input_ids = tokenizer.encode('answer: {}. context: {}'.format(a, context), return_tensors='pt')
            with torch.no_grad():
                outputs = model.generate(input_ids.to(device), max_length=40, num_beams=2)
            q = tokenizer.decode(outputs[0])
            
            item = dict()
            item['question'] = q
            item['answer'] = a
            item['context'] = context
            results.append(item)
            
    return results