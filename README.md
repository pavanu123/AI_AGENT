# AI_AGENT
🧑‍💼 AI Interview Agent — Powered by Groq LLM

An intelligent interview automation tool built with Streamlit + Groq AI that:

✔ Generates role-based interview questions
✔ Lets the interviewer record candidate answers
✔ Evaluates all answers at the end (scores, strengths, weaknesses, improvement tips)
✔ Produces a final hiring report with recommendation

This project is designed to help recruiters, hiring managers, and HR teams conduct structured and unbiased interviews efficiently.

🚀 Features
Feature	Description
📌 Smart Question Generation	AI generates interview questions one-by-one based on role, experience and skills
💾 Answer Collection	Interviewer types or pastes candidate responses — stored automatically
❌ Skip Option	Questions can be skipped without penalty
📄 Resume Parsing (Optional)	Upload PDF/TXT resume and AI auto-extracts skills
🧠 Consistent Evaluation	All answers evaluated only at the end, not per question
📊 Scorecard	Question-wise scoring + average score
🧾 Final AI Report	Full summary including strengths, weaknesses & hiring recommendation
⚡ Powered by Groq	Ultra-fast inference using Groq’s LLM
🧩 Architecture Diagram
User (Interviewer)
        ⬇
Web UI (Streamlit)
        ⬇
Interview Logic (Python)
    ├─ Resume → Skill Extraction
    ├─ Question Generation
    ├─ Answer Storage (Session State)
    ├─ Final Evaluation & Scores
    └─ Final Summary Report
        ⬇
Groq LLM API (llama-3.1-8b-instant)

📁 Project Structure
📦 interview-agent
 ┣ 📜 app.py               ← Main Streamlit application
 ┣ 📜 .env                 ← Groq API key (not pushed to GitHub)
 ┣ 📜 requirements.txt     ← Python dependencies
 ┗ 📜 README.md            ← Documentation (this file)

🔐 Environment Setup

Create a .env file in the project root:

GROQ_API_KEY=your_groq_key_here


You can obtain a free API key from:
🔗 https://console.groq.com

📦 Installation
git clone <your-repo-url>
cd interview-agent
pip install -r requirements.txt

▶ Run the App
streamlit run app.py

🔧 Requirements

requirements.txt should include:

streamlit
pandas
python-dotenv
PyPDF2
groq

🖥 Demo Workflow

1️⃣ Enter candidate details (name, role, experience)
2️⃣ Upload resume (optional to auto-extract skills)
3️⃣ Start interview → AI generates questions
4️⃣ Record candidate answers or skip questions
5️⃣ After last question → click Submit & Generate AI Report
6️⃣ View:

Scoreboard

Average score

Final interview report

Hire recommendation

🎯 Why This Project Stands Out
Advantage	Impact
AI only evaluates at end	Eliminates bias during interview
Resume → Skills extraction	No manual typing required
Structured reporting	Faster decision making
Works fully locally (except API call)	Recruiters retain control
Built on Groq	Very fast inference & low latency
🏗 Future Enhancements (optional ideas for jury)

🔹 Voice input for candidate answers
🔹 Export report to PDF
🔹 HR dashboard to track multiple candidates
🔹 Integration with ATS (Notion DB / Airtable)
🔹 Multi-language interview support

👨‍💻 Tech Stack
Layer	Technology
UI	Streamlit
Backend	Python
LLM	Groq → llama-3.1-8b-instant
Resume Reader	PyPDF2
State Store	Streamlit session state
