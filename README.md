# 🤖 Smart Complaint System | نظام الشكاوى الذكي 🎓

### Umm Al-Qura University | جامعة أم القرى
**College of Computing - Computer Science & AI Department** **Course:** Selected Topics I (1st Term 2025/2026)  
**Group No.:** 5

---

## 📝 Project Overview | نبذة عن المشروع
This project is an AI-powered technical support system designed to handle user complaints efficiently using Large Language Models (LLMs) and Vector Similarity Search.  
يهدف هذا المشروع إلى بناء نظام ذكي لمعالجة شكاوى المستخدمين باستخدام نماذج اللغة الكبيرة والخوارزميات المحلية لضمان تقديم حلول سريعة ودقيقة دون تدخل بشري كبير.

---

## 👥 Team Members | فريق العمل
* 👨‍💻 **Hisham Abdullah Almalki** (444004999)
* 👨‍💻 **Saleh Mohammed Alsulami** (444004924)
* 👨‍💻 **Adel Mohammed Alzahrani** (444004618)
* 👨‍💻 **Ali Abdullah Almufarriji** (444004967)
* 👨‍💻 **Abdulrahman Saud Alzahrani** (444005066)

---

## 🚀 Key Features | المميزات الأساسية
* 🎯 **Smart Classification**: Detects greetings, in-scope problems, and out-of-scope requests.
* 🔍 **Semantic Search**: Uses `text-embedding-3-small` to understand the full meaning of complaints.
* 💬 **Clarification Mode**: Interactively asks for more details if the similarity score is medium.
* 📈 **Automatic Escalation**: Logs unresolved complaints into an Excel file for human review.
* 🖥️ **Professional UI**: Built with a clean Gradio interface.

---

## 🗄️ Data Management | إدارة البيانات
The system operates using a localized data architecture:
* **Primary Data**: `slou.csv` acts as the main knowledge base.
* **Vector Cache**: `embeddings.pkl` stores pre-calculated numerical representations for speed.
* **Error Logging**: `missed_questions.xlsx` functions as a database for unresolved queries.

---

## ⚙️ Technical Workflow | سير العمل التقني
1. **Input**: User submits a complaint.
2. **Filter**: LLM checks if the request is out-of-scope (e.g., Netflix, Social Media).
3. **Vectorization**: Text is converted into a vector representation.
4. **Matching**: Similarity Search compares input with the stored database.
5. **Action**:
    * ✅ **High Match (≥60%)**: Direct solution presented.
    * ❓ **Medium Match (35%-60%)**: Asks up to 2 clarification questions.
    * ⚠️ **Low Match (<35%)**: Logs to `missed_questions.xlsx` and forwards to department.

---

## 📊 Evaluation Results | نتائج التقييم
* ✅ **72.5%** Direct Resolution Rate (29/40 queries).
* 🔍 **20%** Required Clarification.
* 🚫 **7.5%** Identified as Out-of-Scope.

---
## 🛠️ How to Run | طريقة التشغيل
1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    ```
2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
3.  **Setup Environment**:
    Create a `.env` file and add your key:
    `OPENAI_API_KEY=your_key_here`
4.  **Run the App**:
    ```bash
    python main.py
    ```
