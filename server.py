from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv
import os, json, uuid, glob

load_dotenv()

app = Flask(__name__)
# CORS robusto para dev local (en prod restringir origins)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

client = OpenAI(
    api_key=os.environ.get("API_KEY"),
    base_url="https://api.groq.com/openai/v1",
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHATS_DIR = os.path.join(BASE_DIR, "chats")

def ensure_storage():
    os.makedirs(CHATS_DIR, exist_ok=True)

def load_chat(chat_id):
    path = f"{CHATS_DIR}/{chat_id}.json"
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_chat(chat_id, messages):
    path = f"{CHATS_DIR}/{chat_id}.json"
    with open(path, "w", encoding="utf-8") as f:
        json.dump(messages, f, indent=2, ensure_ascii=False)

@app.get("/chats")
def list_chats():
    files = glob.glob(f"{CHATS_DIR}/*.json")
    chat_ids = [os.path.basename(f).replace(".json","") for f in files]
    return jsonify(chat_ids)

@app.get("/chat/<chat_id>")
def get_chat(chat_id):
    messages = load_chat(chat_id)
    return jsonify(messages)

@app.post("/new_chat")
def new_chat():
    chat_id = str(uuid.uuid4())
    save_chat(chat_id, [])
    return jsonify({"chat_id": chat_id})

@app.post("/chat")
def chat():
    data = request.json or {}
    chat_id = data.get("chat_id")
    user_msg = data.get("message", "")

    if not chat_id:
        return jsonify({"error": "chat_id required"}), 400

    history = load_chat(chat_id)

    history.append({"role": "user", "content": user_msg})

    full_context = "\n".join([f"{m['role']}: {m['content']}" for m in history])

    resp = client.responses.create(
        input=full_context,
        model="openai/gpt-oss-20b",
    )

    # extractor robusto de texto
    bot_reply = getattr(resp, "output_text", None)
    if not bot_reply:
        try:
            bot_reply = resp.output[0].content[0].text
        except Exception:
            bot_reply = str(resp)

    history.append({"role": "assistant", "content": bot_reply})

    save_chat(chat_id, history)

    return jsonify({"reply": bot_reply})

if __name__ == "__main__":
    # pre-flight: crear carpeta y mostrar info de debug
    ensure_storage()
    print("CHATS DIR:", os.path.abspath(CHATS_DIR))
    print("API_KEY presente?:", bool(os.environ.get("API_KEY")))
    # arrancar servidor (ver puerto en la consola)
    app.run(host="0.0.0.0", port=5000, debug=True)
