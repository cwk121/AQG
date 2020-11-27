import os
from utils import custom_question, generate_grammar_questions, mark_answers, generate_wh_questions
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='webapp/build')
CORS(app)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')


@app.route("/demo", methods=["POST"])
def demo():
    context = request.values.get("context")
    answer = request.values.get("answer")
    question = custom_question(answer, context)
    return question


@app.route("/grammar", methods=["POST"])
def grammar():
    context = request.values.get("context")
    results = generate_grammar_questions(context)
    return jsonify(results)


@app.route("/mark", methods=["POST"])
def mark():
    context = request.values.get("context")
    return mark_answers(context)


@app.route("/wh", methods=["POST"])
def wh():
    marked = request.values.get("context")
    results = generate_wh_questions(marked)
    return jsonify(results)


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000)
