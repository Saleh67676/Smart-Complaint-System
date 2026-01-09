# 🤖 Smart Complaint System | نظام الشكاوى الذكي 🎓

### Umm Al-Qura University | جامعة أم القرى
**College of Computing - Computer Science & AI Department** **Course:** Selected Topics I (1st Term 2025/2026)  
**Group No.:** 5

---

## 📝 Project Overview | نبذة عن المشروع
This project is a specialized **Domain-Specific RAG (Retrieval-Augmented Generation) system** designed to handle user complaints efficiently using Large Language Models (LLMs) and Vector Similarity Search. Unlike general AI chatbots, this system is strictly focused on University IT support to ensure high accuracy and zero hallucinations.

يهدف هذا المشروع إلى بناء نظام ذكي مخصص لمعالجة شكاوى الدعم الفني بالجامعة، حيث يجمع بين دقة الخوارزميات المحلية وقوة نماذج اللغة الكبيرة لضمان تقديم حلول موثوقة وموثقة دون تدخل بشري كبير.

---

## 👥 Team Members (Group 5) | فريق العمل
* 👨‍💻 **Hisham Abdullah Almalki** (444004999)
* 👨‍💻 **Saleh Mohammed Alsulami** (444004924)
* 👨‍💻 **Adel Mohammed Alzahrani** (444004618)
* 👨‍💻 **Ali Abdullah Almufarriji** (444004967)
* 👨‍💻 **Abdulrahman Saud Alzahrani** (444005066)

---

## 🚀 Key Features | المميزات الأساسية
* 🎯 **Specialized Scope**: Explicitly filters out-of-scope requests (e.g., social media, Netflix) to maintain professional focus on university services.
* 🔍 **Semantic Deep Search**: Uses `text-embedding-3-small` to understand the full context and meaning of a complaint rather than just keyword matching.
* 💬 **Intelligent Clarification**: If the solution match is medium (35%-60%), the system interactively asks for more details.
* 📈 **Automatic Escalation**: Any unresolved query (score < 35%) is automatically logged into an Excel file for human review.
* 🖥️ **Gradio UI**: Features a clean, professional, and user-friendly interface for seamless interaction.

---

## ⚙️ Technical Workflow | سير العمل التقني
1.  **Classification**: The system determines if the message is a greeting, an in-scope problem, or an out-of-scope request.
2.  **Vectorization**: In-scope complaints are converted into digital vectors using OpenAI's embedding model.
3.  **Similarity Match**: The system compares the complaint vector with pre-stored solution vectors in the local database.
4.  **Decision Logic**:
    * ✅ **High Match (≥60%)**: A professionally formatted solution is provided immediately.
    * ❓ **Medium Match (35%-60%)**: The system asks for clarification to improve accuracy.
    * ⚠️ **Low Match (<35%)**: Details are logged to `missed_questions.xlsx` and forwarded to the relevant department.

---

## 🗄️ Data & Storage | إدارة البيانات
The system operates using a localized and optimized data architecture:
* **Primary Database**: `slou.csv` serves as the main knowledge base containing verified solutions.
* **Vector Cache**: `embeddings.pkl` stores pre-calculated numerical representations for high-speed similarity matching.
* **Incident Log**: `missed_questions.xlsx` functions as a dynamic database for unresolved queries and human follow-up.

---

## 📊 Evaluation Results | نتائج التقييم
* ✅ **72.5%** Direct Resolution Rate (29/40 test queries).
* 🔍 **20%** Required Clarification for higher precision.
* 🚫 **7.5%** Successfully identified and filtered as Out-of-Scope.

---

## 🛠️ How to Run | طريقة التشغيل
1.  **Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
2.  **Data Setup**: Ensure `slou.csv` is in the root directory. The system will auto-generate `embeddings.pkl` on the first run to cache the vector database.
3.  **API Key**: Create a `.env` file and add: `OPENAI_API_KEY=your_key_here`.
4.  **Execution**:
    ```bash
    python main.py
    ```
