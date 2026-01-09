# 🤖 Smart Complaint System | نظام الشكاوى الذكي 🎓

### Umm Al-Qura University | جامعة أم القرى
[cite_start]**College of Computing - Computer Science & AI Department** [cite: 2, 3]  
[cite_start]**Course:** Selected Topics I (1st Term 2025/2026) [cite: 4]  
[cite_start]**Group No.:** 5 [cite: 6]

---

## 📝 Project Overview | نبذة عن المشروع
[cite_start]This project is an AI-powered technical support system designed to handle user complaints efficiently using Large Language Models (LLMs) and Vector Similarity Search. [cite: 12]  
[cite_start]يهدف هذا المشروع إلى بناء نظام ذكي لمعالجة شكاوى المستخدمين باستخدام نماذج اللغة الكبيرة والخوارزميات المحلية لضمان تقديم حلول سريعة ودقيقة دون تدخل بشري كبير. [cite: 12, 19]

---

## 👥 Team Members | [cite_start]فريق العمل [cite: 8]
* 👨‍💻 **Hisham Abdullah Almalki** (444004999)
* 👨‍💻 **Saleh Mohammed Alsulami** (444004924)
* 👨‍💻 **Adel Mohammed Alzahrani** (444004618)
* 👨‍💻 **Ali Abdullah Almufarriji** (444004967)
* 👨‍💻 **Abdulrahman Saud Alzahrani** (444005066)

---

## 🚀 Key Features | المميزات الأساسية
* [cite_start]**Smart Classification**: Detects greetings, in-scope problems, and out-of-scope requests. [cite: 13, 67]
* [cite_start]**Semantic Search**: Uses `text-embedding-3-small` to understand the full meaning of complaints. [cite: 14, 28]
* [cite_start]**Clarification Mode**: Interactively asks for more details if the similarity score is between 35% and 60%. [cite: 17, 48]
* [cite_start]**Automatic Escalation**: Logs unresolved complaints into an Excel file for human review. [cite: 59, 106]
* [cite_start]**Professional UI**: Built with a clean **Gradio** interface. [cite: 194, 489]

---

## ⚙️ Technical Workflow | [cite_start]سير العمل التقني [cite: 95-108]
1.  [cite_start]**Input**: User submits a complaint. [cite: 96]
2.  [cite_start]**Filter**: LLM checks if the request is out-of-scope (e.g., Netflix, Social Media). [cite: 53, 54, 372-376]
3.  [cite_start]**Vectorization**: Text is converted into a vector representation. [cite: 100]
4.  [cite_start]**Matching**: Similarity Search compares input with the stored database. [cite: 101]
5.  **Action**:
    * [cite_start]**High Match (≥60%)**: Direct solution presented. [cite: 102]
    * [cite_start]**Medium Match (35%-60%)**: Asks up to 2 clarification questions. [cite: 103, 104]
    * [cite_start]**Low Match (<35%)**: Logs to `missed_questions.xlsx` and forwards to department. [cite: 106, 108]

---

## 📊 Evaluation Results | [cite_start]نتائج التقييم [cite: 509]
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
