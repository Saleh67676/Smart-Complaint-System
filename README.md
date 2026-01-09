# 🤖 Smart Complaint System | نظام الشكاوى الذكي 🎓

### Umm Al-Qura University | جامعة أم القرى
[cite_start]**College of Computing - Computer Science & AI Department** [cite: 2, 3]  
[cite_start]**Course:** Selected Topics I (1st Term 2025/2026) [cite: 4]  
[cite_start]**Group No.:** 5 [cite: 6]

---

## 📝 Project Overview | نبذة عن المشروع
[cite_start]This project is a specialized **Domain-Specific RAG (Retrieval-Augmented Generation) system** designed to handle user complaints efficiently using Large Language Models (LLMs) and Vector Similarity Search[cite: 12]. [cite_start]Unlike general AI chatbots, this system is strictly focused on University IT support to ensure high accuracy and zero hallucinations[cite: 56, 90].

[cite_start]يهدف هذا المشروع إلى بناء نظام ذكي مخصص لمعالجة شكاوى الدعم الفني بالجامعة، حيث يجمع بين دقة الخوارزميات المحلية وقوة نماذج اللغة الكبيرة لضمان تقديم حلول موثوقة وموثقة دون تدخل بشري كبير[cite: 12, 19, 93].

---

## 👥 Team Members (Group 5) | [cite_start]فريق العمل [cite: 8]
* 👨‍💻 **Hisham Abdullah Almalki** (444004999)
* 👨‍💻 **Saleh Mohammed Alsulami** (444004924)
* 👨‍💻 **Adel Mohammed Alzahrani** (444004618)
* 👨‍💻 **Ali Abdullah Almufarriji** (444004967)
* 👨‍💻 **Abdulrahman Saud Alzahrani** (444005066)

---

## 🚀 Key Features | المميزات الأساسية
* [cite_start]🎯 **Specialized Scope**: Explicitly filters out-of-scope requests (e.g., social media, Netflix) to maintain professional focus on university services [cite: 53, 54, 372-382].
* [cite_start]🔍 **Semantic Deep Search**: Uses `text-embedding-3-small` to understand the full context and meaning of a complaint rather than just keyword matching[cite: 14, 28, 29].
* [cite_start]💬 **Intelligent Clarification**: If the solution match is medium (35%-60%), the system interactively asks for more details[cite: 17, 48, 76].
* [cite_start]📈 **Automatic Escalation**: Any unresolved query (score < 35%) is automatically logged into an Excel file for human review[cite: 58, 59, 106].
* [cite_start]🖥️ **Gradio UI**: Features a clean, professional, and user-friendly interface for seamless interaction[cite: 194, 489].

---

## ⚙️ Technical Workflow | [cite_start]سير العمل التقني [cite: 95-108]
1.  [cite_start]**Classification**: The system determines if the message is a greeting, an in-scope problem, or an out-of-scope request[cite: 13, 67].
2.  [cite_start]**Vectorization**: In-scope complaints are converted into digital vectors using OpenAI's embedding model[cite: 14, 100].
3.  [cite_start]**Similarity Match**: The system compares the complaint vector with pre-stored solution vectors in the local database[cite: 15, 35, 101].
4.  **Decision Logic**:
    * [cite_start]✅ **High Match (≥60%)**: A professionally formatted solution is provided immediately[cite: 16, 102].
    * [cite_start]❓ **Medium Match (35%-60%)**: The system asks for clarification to improve accuracy[cite: 17, 103].
    * [cite_start]⚠️ **Low Match (<35%)**: Details are logged to `missed_questions.xlsx` and forwarded to the relevant department[cite: 18, 106].

---

## 🗄️ Data & Storage | إدارة البيانات
The system operates using a localized and optimized data architecture:
* [cite_start]**Primary Database**: `slou.csv` serves as the main knowledge base containing verified solutions[cite: 204, 221].
* [cite_start]**Vector Cache**: `embeddings.pkl` stores pre-calculated numerical representations for high-speed similarity matching [cite: 203, 230-234].
* [cite_start]**Incident Log**: `missed_questions.xlsx` functions as a dynamic database for unresolved queries and human follow-up [cite: 341-356].

---

## 📊 Evaluation Results | [cite_start]نتائج التقييم [cite: 509]
* ✅ **72.5%** Direct Resolution Rate (29/40 test queries).
* 🔍 **20%** Required Clarification for higher precision.
* 🚫 **7.5%** Successfully identified and filtered as Out-of-Scope.

---

## 🛠️ How to Run | طريقة التشغيل
1.  **Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Data Setup**: Ensure `slou.csv` is in the root directory. [cite_start]The system will auto-generate `embeddings.pkl` on the first run to cache the vector database [cite: 226-234].
3.  **API Key**: Create a `.env` file and add: `OPENAI_API_KEY=your_key_here`.
4.  **Execution**:
    ```bash
    python main.py
    ``````
