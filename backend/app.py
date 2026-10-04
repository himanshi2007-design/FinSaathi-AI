
import os
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

load_dotenv("backend/.env")

app = Flask(__name__)
CORS(app)

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("Gemini API key not found in backend/.env")

client = genai.Client(api_key=api_key)

MODEL = "gemini-3.8-flash"
print("RUNNING UPDATED BACKEND WITH MODEL:", MODEL)


def ask_gemini(prompt):
    response = client.models.generate_content(
        model=MODEL,
        contents=prompt
    )

    if not response.text:
        raise ValueError("Gemini returned an empty response")

    return response.text


@app.route("/")
def home():
    return "FinSaathi AI Backend is Running!"


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True) or {}

    message = data.get("message", "").strip()
    language = data.get("language", "English")

    if not message:
        return jsonify({"error": "Please enter a question"}), 400

    prompt = f"""
    You are FinSaathi AI, a financial education assistant
    for Indian users.

    Explain financial concepts in simple language.
    Answer in {language}.
    Be accurate, beginner-friendly and clear.
    Do not provide personalized investment advice.
    Never guarantee financial returns.

    User question: {message}
    """

    try:
        reply = ask_gemini(prompt)
        return jsonify({"reply": reply})

    # except Exception:
    #     print("CHAT ERROR:")
    #     traceback.print_exc()
    #     return jsonify({"error": "Unable to generate a reply"}), 500
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



@app.route("/api/simplify", methods=["POST"])
def simplify():
    try:
        data = request.get_json()

        text = data.get("text", "").strip()
        language = data.get("language", "English")

        if not text:
            return jsonify({"error": "Please enter some text"}), 400

        prompt = f"""
You are FinSaathi AI, a financial education assistant.

Your task is to explain ONLY the text provided by the user.

Original text:
{text}

Instructions:
- Explain the exact meaning of the original text in simple {language}.
- Do not discuss unrelated financial concepts.
- Do not invent information or add examples unrelated to the text.
- Identify important terms only if they appear in or are directly relevant to the original text.
- Explain any risks or conditions mentioned in the original text.
- If the text is a financial warning or disclaimer, explain that warning clearly.
- Keep the answer short and easy to understand.
- Do not change the meaning of the original text.

Use this format:

Simple explanation:
[Explanation]

Important terms:
[Terms, if any]

Risks and conditions:
[Relevant risks or conditions]
"""

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        result = response.text

        if not result:
            raise Exception("Gemini returned an empty response")

        return jsonify({"simplified_text": result})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
