
from openai import OpenAI
import numpy as np
import pandas as pd
from dotenv import load_dotenv
import os
import json
import pickle
import gradio as gr
from sklearn.metrics.pairwise import cosine_similarity
from pathlib import Path
from datetime import datetime

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# File paths and similarity thresholds
EMBEDDINGS_FILE = "embeddings.pkl"
DATA_FILE = "slou.csv"
MISSED_QUESTIONS_FILE = "missed_questions.xlsx"
HIGH_MATCH = 0.60
MEDIUM_MATCH = 0.35

def get_embedding(text):
    """Generate embedding vector for text using OpenAI API"""
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding error: {e}")
        return None

def load_data_and_embeddings():
    """Load dataset and embeddings, generate if not cached"""
    data = pd.read_csv(DATA_FILE)
    if Path(EMBEDDINGS_FILE).exists():
        with open(EMBEDDINGS_FILE, "rb") as f:
            data["embedding"] = pickle.load(f)
        print("Embeddings loaded")
    else:
        print("Generating embeddings...")
        data["embedding"] = data["problem"].apply(get_embedding)
        with open(EMBEDDINGS_FILE, "wb") as f:
            pickle.dump(data["embedding"].tolist(), f)
        print("Embeddings saved")
    return data

data = load_data_and_embeddings()

def find_best_match(query):
    """Find most similar problem in dataset using cosine similarity"""
    query_emb = get_embedding(query)
    if query_emb is None:
        return None, 0, None
    all_embs = np.vstack(data["embedding"].tolist())
    sims = cosine_similarity([query_emb], all_embs)[0]
    idx = int(np.argmax(sims))
    row = data.iloc[idx]
    return row, float(sims[idx]), row.get("department", "القسم المختص")

def is_problem_or_question(message):
    """Check if message is a real problem/question or just a greeting"""
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Classify if this is a real problem/question or just a greeting.

"problem": Real problem with details OR clear question
- "ما أقدر أدخل البوابة"
- "عندي مشكلة بالبريد الإلكتروني"
- "الإنترنت بطيء"

"general": Greeting or vague statement WITHOUT details
- "مرحبا", "السلام عليكم"
- "عندي مشكلة" (alone, no details)
- "ساعدني" (alone)

Respond with JSON: {"type": "problem"} or {"type": "general"}"""
                },
                {"role": "user", "content": message}
            ],
            response_format={"type": "json_object"}
        )
        result = json.loads(resp.choices[0].message.content)
        return result.get("type") == "problem"
    except Exception:
        return True

def format_solution(problem, solution_text):
    """Rewrite solution in clear and polite manner"""
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Rewrite the solution in a clear, polite, and concise manner. Do not add new information"},
                {"role": "user", "content": f"مشكلتك هي: {problem}\nالحل: {solution_text}"}
            ]
        )
        return resp.choices[0].message.content
    except Exception:
        return solution_text

def summarize_problem(context_list):
    """Combine multiple user messages into one clear problem summary"""
    try:
        details = "\n".join(f"- {c}" for c in context_list)
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Summarize the user's problem in one clear sentence that captures all the provided details."},
                {"role": "user", "content": f"تفاصيل المشكلة:\n{details}"}
            ]
        )
        return resp.choices[0].message.content
    except Exception:
        return " ".join(context_list)

def ask_clarification(context_list, attempt):
    """Ask user for more details to better understand their problem"""
    try:
        details = "\n".join(f"- {c}" for c in context_list)
        if attempt == 1:
            prompt = (
                f"The user has a problem:\n{details}\n\n"
                "Ask for ONE specific clarification. Ask only ONE clear question (for example:\n"
                "- What is the error message?\n"
                "- When did the issue start?\n"
                "- Did you try any solution?).\n\n"
                "Your response must be concise and polite."
            )
        else:
            prompt = (
                "The user has a problem and the solution is still unclear.\n\n"
                f"Here are the details provided so far:\n{details}\n\n"
                "Ask for additional clarification and reference what the user has already stated.\n"
                "Make sure your question is different from the previous one.\n"
                "Keep your response concise and polite."
            )
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a polite and helpful technical support assistant responsible for asking the user for clarifications."},
                {"role": "user", "content": prompt}
            ]
        )
        return resp.choices[0].message.content
    except Exception:
        return "هل يمكنك توضيح المشكلة أكثر؟ ما الذي يحدث بالضبط؟"

def log_missed_question(context_list, summary, department, score):
    """Save unresolved questions to Excel for review"""
    try:
        file_path = Path(MISSED_QUESTIONS_FILE)
        record = {
            "timestamp": datetime.utcnow().isoformat(),
            "original_text": "\n".join(context_list),
            "summary": summary,
            "department": department,
            "score": float(f"{score:.2f}")
        }
        if file_path.exists():
            df = pd.read_excel(file_path)
            df = pd.concat([df, pd.DataFrame([record])], ignore_index=True)
        else:
            df = pd.DataFrame([record])
        df.to_excel(file_path, index=False)
    except Exception as e:
        print(f"Error while logging missed question: {e}")

def is_out_of_scope(message):
    """Check if question is about external services outside IT support scope"""
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": """Check if the message is about external services NOT related to university IT support.

OUT OF SCOPE (return true):
- YouTube, Netflix, streaming platforms
- Social media: Facebook, Twitter, Instagram, TikTok, Snapchat, WhatsApp (personal)
- Gaming platforms, personal apps
- Personal devices/accounts not related to university

IN SCOPE (return false):
- University network, internet, WiFi
- University email
- University portals, Blackboard, learning systems
- University computers, printers, labs

Respond with JSON: {"out_of_scope": true} or {"out_of_scope": false}"""
                },
                {"role": "user", "content": message}
            ],
            response_format={"type": "json_object"}
        )
        result = json.loads(resp.choices[0].message.content)
        return result.get("out_of_scope", False)
    except Exception:
        return False

def respond(message, history, session_state):
    """Main response logic handling different conversation states"""
    if session_state is None:
        session_state = {
            "context": [],
            "attempt": 0,
            "awaiting": False,
            "last_score": 0
        }

    # Handle follow-up responses when awaiting clarification
    if session_state["awaiting"]:
        session_state["context"].append(message)
        session_state["attempt"] += 1
        summary = summarize_problem(session_state["context"])
        print(f"Summary: {summary}")
        
        match, score, department = find_best_match(summary)
        print(f"Score (attempt {session_state['attempt']}): {score:.2%}")
        
        if match is None:
            return "عذراً، حدث خطأ. حاول مرة أخرى.", session_state

        session_state["last_score"] = score
        
        # High confidence - provide solution
        if score >= HIGH_MATCH:
            solution = format_solution(summary, match['solution'])
            session_state = {
                "context": [],
                "attempt": 0,
                "awaiting": False,
                "last_score": 0
            }
            return solution, session_state
        
        # Medium confidence - ask one more time
        if score >= 0.40 and session_state["attempt"] < 2:
            return ask_clarification(session_state["context"], 2), session_state
        
        # Low confidence - escalate to department
        details_summary = "\n".join([f"• {c}" for c in session_state["context"]])
        try:
            log_missed_question(
                context_list=session_state["context"],
                summary=summary,
                department=department,
                score=score
            )
        except Exception as e:
            print(f"Failed to log missed question: {e}")
        
        response_text = f"""عذراً، لم أتمكن من إيجاد حل مباشر لمشكلتك.

📋 *ملخص مشكلتك:*
{details_summary}

تم إرسال شكواك إلى: *{department}*

سيتم التواصل معك قريباً. شكراً لتفهمك!"""
        
        session_state = {
            "context": [],
            "attempt": 0,
            "awaiting": False,
            "last_score": 0
        }
        return response_text, session_state

    # Check if message is just a greeting
    if not is_problem_or_question(message):
        return "مرحباً! أنا هنا لمساعدتك. أرسل تفاصيل مشكلتك أو سؤالك وسأحاول مساعدتك 😊", session_state
    
    # Check if question is outside support scope
    if is_out_of_scope(message):
        print(f"❌ Out of scope detected: {message}")
        return "عذراً، هذا الموضوع خارج نطاق تخصصي ولا أستطيع مساعدتك فيه.", session_state
    
    # Search for solution in database
    match, score, department = find_best_match(message)
    print(f"Initial score: {score:.2%}")
    
    if match is None:
        return "عذراً، حدث خطأ. حاول مرة أخرى.", session_state
    
   # High confidence match - provide direct solution
    if score >= HIGH_MATCH:
        return format_solution(message, match['solution']), session_state
    
    # Medium confidence - ask for clarification
    if score >= MEDIUM_MATCH:
        session_state = {
            "context": [message],
            "attempt": 1,
            "awaiting": True,
            "last_score": score
        }
        return ask_clarification([message], 1), session_state
    
    # ==========================================
    # Low confidence (< 0.35) - Escalate directly
    # هذا الجزء يجب أن يكون على نفس مستوى الـ if السابقة
    # ==========================================
    try:
        log_missed_question([message], message, department, score)
    except Exception as e:
        print(f"Error logging: {e}")

    return f"عذراً، لا أستطيع حل مشكلتك مباشرة.\nتم رفع المشكلة إلى القسم المختص: *{department}*", session_state

# Gradio interface setup
with gr.Blocks(theme="soft") as demo:
    gr.Markdown("# 🤖 المساعد الذكي للدعم الفني\nأرسل مشكلتك أو سؤالك وسأساعدك")
    
    chatbot = gr.Chatbot(type="messages", height=400)
    msg = gr.Textbox(placeholder="اكتب رسالتك هنا...", rtl=True)
    session = gr.State(None)
    
    def user_submit(message, history, session_state):
        message = message.strip()
        if not message:
            return "", history, session_state
        
        history.append({"role": "user", "content": message})
        reply, session_state = respond(message, history, session_state)
        history.append({"role": "assistant", "content": reply})
        
        return "", history, session_state
    
    def clear_chat():
        return [], None
    
    msg.submit(user_submit, [msg, chatbot, session], [msg, chatbot, session])
    
    gr.Button("🔄 مسح المحادثة").click(clear_chat, None, [chatbot, session])

demo.launch()
