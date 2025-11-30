import os

from dotenv import load_dotenv
import streamlit as st
import pandas as pd
from groq import Groq
from PyPDF2 import PdfReader  # For reading PDF resumes

# ---------- Load API key ----------
load_dotenv(override=True)
API_KEY = os.getenv("GROQ_API_KEY")

client = None
if API_KEY:
    client = Groq(api_key=API_KEY)

# ---------- System prompts ----------
INTERVIEWER_SYSTEM = """
You are an expert technical interviewer and HR interviewer.
You create clear, focused interview questions for software and non-software roles.
Ask one question at a time. Do NOT answer the question yourself.
"""

EVALUATOR_SYSTEM = """
You are an expert interview evaluator and hiring manager.
You evaluate candidate answers for job roles and give:
- A score from 1 to 10
- Strengths
- Weaknesses
- Improvement suggestions

ALWAYS respond in this exact structure:

SCORE: <number from 1 to 10>

STRENGTHS:
<bullet points or short paragraph>

WEAKNESSES:
<bullet points or short paragraph>

IMPROVEMENT_TIPS:
<bullet points or short paragraph>
"""

SUMMARY_SYSTEM = """
You are an expert hiring manager summarizing an interview.
Based on the interview history, give:

1. Overall summary (5–8 lines)
2. Key strengths (list)
3. Key weaknesses (list)
4. Recommended level (e.g., Intern / Junior / Mid-level / Senior)
5. Final recommendation: Strong Hire / Hire / Neutral / No Hire (with 1–2 line reason)
"""

SKILL_EXTRACTOR_SYSTEM = """
You are an assistant that reads resume text and extracts the key technical and professional skills.
Return ONLY a concise, comma-separated list of skills. Do not add explanations.
"""

# ---------- Helper: call Groq ----------
def call_groq(
    system_prompt: str,
    user_prompt: str,
    temperature: float = 0.7,
    max_tokens: int = 2000,
) -> str:
    if client is None:
        return "ERROR: GROQ_API_KEY is not set. Please configure it before using the app."

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error while calling model: {e}"

# ---------- Helper: extract skills from resume ----------
def extract_skills_from_resume(resume_text: str) -> str:
    """
    Uses the LLM to extract a clean list of skills from resume text.
    """
    user_prompt = f"""
Below is the full resume text.

RESUME:
\"\"\"{resume_text}\"\"\"

Task:
Extract the main technical and professional skills mentioned in this resume.
Return ONLY a comma-separated list of skills, nothing else.
"""
    skills_text = call_groq(
        SKILL_EXTRACTOR_SYSTEM,
        user_prompt,
        temperature=0.2,
        max_tokens=300,
    )
    return skills_text.strip()

# ---------- Helper: generate next question ----------
def generate_question(
    role: str,
    experience: str,
    skills: str,
    interview_type: str,
    question_no: int,
) -> str:
    user_prompt = f"""
Job role: {role}
Experience level: {experience}
Key skills / technologies: {skills}
Interview type: {interview_type}
Question number: {question_no}

Task:
Create ONE interview question only.

Guidelines:
- Focus on the role and skills.
- For early questions (1-2), keep it slightly easier and open-ended.
- Later questions can be more detailed or scenario-based.
- Do NOT include the answer.
- Do NOT include any extra text like "Here's your question".

Just output the question text.
"""
    question = call_groq(
        INTERVIEWER_SYSTEM,
        user_prompt,
        temperature=0.6,
        max_tokens=400,
    )
    return question.strip()

# ---------- Helper: evaluate answer ----------
def evaluate_answer(
    question: str,
    answer: str,
    role: str,
    experience: str,
    skills: str,
) -> str:
    user_prompt = f"""
Job role: {role}
Experience level: {experience}
Key skills / technologies: {skills}

Interview question:
{question}

Candidate answer:
{answer}

Task:
Evaluate the answer strictly for this role and experience level.
Follow the required response structure.
"""
    evaluation = call_groq(
        EVALUATOR_SYSTEM,
        user_prompt,
        temperature=0.4,
        max_tokens=600,
    )
    return evaluation.strip()

# ---------- Helper: parse score from evaluation ----------
def extract_score(evaluation_text: str) -> int:
    """
    Looks for a line starting with 'SCORE:' and returns the integer.
    If not found, returns -1.
    """
    for line in evaluation_text.splitlines():
        line = line.strip()
        if line.upper().startswith("SCORE"):
            parts = line.split(":")
            if len(parts) >= 2:
                try:
                    score = int(parts[1].strip().split()[0])
                    return score
                except ValueError:
                    return -1
    return -1

# ---------- Helper: generate final summary ----------
def generate_summary(
    candidate_name: str,
    role: str,
    experience: str,
    skills: str,
    history: list,
) -> str:
    history_text = ""
    for i, item in enumerate(history, start=1):
        history_text += f"""
Question {i}: {item['question']}
Candidate answer: {item['answer']}
Evaluation:
{item['evaluation']}

-----------------------------
"""

    user_prompt = f"""
Candidate name: {candidate_name}
Job role: {role}
Experience level: {experience}
Key skills / technologies: {skills}

Interview history:
{history_text}

Task:
Provide an overall interview summary and recommendation.
"""
    summary = call_groq(
        SUMMARY_SYSTEM,
        user_prompt,
        temperature=0.4,
        max_tokens=800,
    )
    return summary.strip()

# ---------- Streamlit UI setup ----------
st.set_page_config(
    page_title="AI Interview Agent",
    layout="wide",
)

# ---------- Global CSS to mimic nicer UI/UX ----------
st.markdown(
    """
    <style>
    /* Page background */
    body {
        background: linear-gradient(135deg, #f5f7fb, #eef3ff);
    }
    .main {
        background: transparent;
    }
    div.block-container {
        padding-top: 1.5rem;
        padding-bottom: 1.5rem;
    }
    /* Cards */
    .stCard {
        background-color: #ffffff;
        border-radius: 16px;
        padding: 16px 18px;
        box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06);
        border: 1px solid rgba(15,23,42,0.03);
        margin-bottom: 1rem;
    }
    /* Buttons */
    .stButton>button {
        border-radius: 999px !important;
        padding: 0.35rem 0.9rem;
        font-size: 0.85rem;
        font-weight: 500;
    }
    .primary-btn>button {
        background-color: #2563eb !important;
        color: #ffffff !important;
        box-shadow: 0 8px 18px rgba(37, 99, 235, 0.25);
        border: none;
    }
    .secondary-btn>button {
        background-color: #f3f4f6 !important;
        color: #111827 !important;
        border: none;
    }
    .ghost-btn>button {
        background-color: transparent !important;
        color: #4b5563 !important;
        border: 1px solid #e5e7eb !important;
    }
    /* Metric styling */
    div[data-testid="stMetricValue"] {
        font-size: 1.1rem;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ---------- Header ----------
st.title("🧑‍💻 AI Interview Agent")
st.caption(
    "Smart interview assistant that asks questions, stores answers, and generates a final AI evaluation report."
)

if client is None:
    st.error("GROQ_API_KEY is not set. Please configure it in a .env file.")
    st.stop()

# ---------- Sidebar: Candidate & Job Info ----------
st.sidebar.header("👤 Candidate & Job Info")

candidate_name = st.sidebar.text_input("Candidate name", placeholder="e.g., Pavan")
job_role = st.sidebar.text_input("Job role", placeholder="e.g., Python Developer Intern")
experience_level = st.sidebar.selectbox(
    "Experience level",
    ["Fresher", "0–1 years", "1–3 years", "3–5 years", "5+ years"],
    index=0,
)

st.sidebar.subheader("📄 Resume & Skills")

resume_file = st.sidebar.file_uploader(
    "Upload candidate resume (PDF or .txt)",
    type=["pdf", "txt"],
    help="If provided, the agent will try to auto-extract key skills.",
)

# Session state for skills input
if "skills_input" not in st.session_state:
    st.session_state.skills_input = ""

# Button to extract skills from resume
if resume_file is not None:
    if st.sidebar.button("✨ Extract skills from resume"):
        try:
            if resume_file.name.lower().endswith(".pdf"):
                reader = PdfReader(resume_file)
                text_content = ""
                for page in reader.pages:
                    text_content += page.extract_text() or ""
            else:  # assume .txt file
                text_content = resume_file.read().decode("utf-8", errors="ignore")

            with st.spinner("Extracting skills from resume..."):
                extracted = extract_skills_from_resume(text_content)

            if extracted.startswith("ERROR"):
                st.sidebar.error(extracted)
            else:
                st.session_state.skills_input = extracted
                st.sidebar.success("Skills extracted from resume!")
        except Exception as e:
            st.sidebar.error(f"Failed to read resume: {e}")

skills = st.sidebar.text_area(
    "Key skills / technologies",
    key="skills_input",
    placeholder="e.g., Python, SQL, Data Structures, Django, REST APIs",
)

interview_type = st.sidebar.selectbox(
    "Interview type",
    ["Technical", "HR / Behavioral", "Mixed"],
    index=2,
)

num_questions = st.sidebar.slider("Number of questions (target)", 3, 10, 5)

st.sidebar.info(
    "Fill these details first. The agent will use them to generate relevant questions and later evaluate all answers at once."
)

job_ready = all([candidate_name.strip(), job_role.strip(), skills.strip()])

# ---------- Init session state ----------
if "interview_started" not in st.session_state:
    st.session_state.interview_started = False
if "current_question" not in st.session_state:
    st.session_state.current_question = ""
if "current_q_no" not in st.session_state:
    st.session_state.current_q_no = 0
if "history" not in st.session_state:
    st.session_state.history = []  # list of dicts: question_no, question, answer, evaluation, score
if "summary_generated" not in st.session_state:
    st.session_state.summary_generated = False
if "summary_text" not in st.session_state:
    st.session_state.summary_text = ""

# ---------- Layout: two main columns ----------
left_col, right_col = st.columns([2, 1])

# ---------- Left: Interview Flow ----------
with left_col:
    st.markdown('<div class="stCard">', unsafe_allow_html=True)
    st.subheader("🎯 Interview Flow")

    if not job_ready:
        st.warning(
            "Please fill Candidate & Job Info and skills (or extract from resume) "
            "in the sidebar to start the interview."
        )
    else:
        # Start / Reset buttons row
        c1, c2 = st.columns(2)
        with c1:
            start_btn = st.container()
            with start_btn:
                st.write("")
                start_click = st.button("▶️ Start / Continue Interview", key="start_btn")
        with c2:
            reset_btn = st.container()
            with reset_btn:
                st.write("")
                reset_click = st.button("🔄 Reset Interview", key="reset_btn")

        if reset_click:
            st.session_state.interview_started = False
            st.session_state.current_question = ""
            st.session_state.current_q_no = 0
            st.session_state.history = []
            st.session_state.summary_generated = False
            st.session_state.summary_text = ""
            st.success("Interview has been reset.")

        if start_click:
            if not st.session_state.interview_started:
                st.session_state.interview_started = True
                st.session_state.current_q_no = 1
                st.session_state.history = []
                st.session_state.summary_generated = False
                st.session_state.summary_text = ""
            if not st.session_state.current_question:
                st.session_state.current_question = generate_question(
                    role=job_role,
                    experience=experience_level,
                    skills=skills,
                    interview_type=interview_type,
                    question_no=st.session_state.current_q_no,
                )

        # Show current question & answer box
        if st.session_state.interview_started and st.session_state.current_question:
            st.markdown(
                f"<p style='font-size:11px;color:#6b7280;'>Question {st.session_state.current_q_no} of {num_questions}</p>",
                unsafe_allow_html=True,
            )
            st.markdown(
                f"<div style='padding:10px 12px;border-radius:12px;background:#f9fafb;border:1px solid #e5e7eb;'>"
                f"<div style='font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#6b7280;margin-bottom:4px;'>Question</div>"
                f"<div style='font-size:14px;color:#111827;'>{st.session_state.current_question}</div>"
                f"</div>",
                unsafe_allow_html=True,
            )

            answer = st.text_area(
                "Type candidate's answer here:",
                key=f"answer_q_{st.session_state.current_q_no}",
                height=150,
            )

            c3, c4 = st.columns(2)
            with c3:
                save_next_btn = st.button("💾 Save Answer & Next Question")
            with c4:
                skip_btn = st.button("⏭ Skip Question")

            if save_next_btn:
                if not answer.strip():
                    st.warning("Please enter an answer before saving, or use Skip.")
                else:
                    st.session_state.history.append(
                        {
                            "question_no": st.session_state.current_q_no,
                            "question": st.session_state.current_question,
                            "answer": answer,
                            "evaluation": "",  # to be filled later
                            "score": -1,       # to be filled later
                        }
                    )

                    if st.session_state.current_q_no < num_questions:
                        st.session_state.current_q_no += 1
                        st.session_state.current_question = generate_question(
                            role=job_role,
                            experience=experience_level,
                            skills=skills,
                            interview_type=interview_type,
                            question_no=st.session_state.current_q_no,
                        )
                    else:
                        st.session_state.current_question = ""
                        st.info(
                            "All questions completed. Go to the right panel and click "
                            "'Submit & Generate AI Report'."
                        )

            if skip_btn:
                st.warning("Question skipped.")
                st.session_state.history.append(
                    {
                        "question_no": st.session_state.current_q_no,
                        "question": st.session_state.current_question,
                        "answer": "(Skipped)",
                        "evaluation": "Not evaluated (skipped by interviewer).",
                        "score": -1,
                    }
                )
                if st.session_state.current_q_no < num_questions:
                    st.session_state.current_q_no += 1
                    st.session_state.current_question = generate_question(
                        role=job_role,
                        experience=experience_level,
                        skills=skills,
                        interview_type=interview_type,
                        question_no=st.session_state.current_q_no,
                    )
                else:
                    st.session_state.current_question = ""
                    st.info(
                        "All questions completed. Go to the right panel and click "
                        "'Submit & Generate AI Report'."
                    )

        elif st.session_state.interview_started and not st.session_state.current_question:
            st.info(
                "Interview questions finished. Go to the right panel and click "
                "'Submit & Generate AI Report'."
            )

    st.markdown("</div>", unsafe_allow_html=True)

    # Small card: answered/skipped overview
    if st.session_state.history:
        st.markdown('<div class="stCard">', unsafe_allow_html=True)
        st.subheader("🗂 Answered Questions")
        st.write("Quick overview of which questions were answered or skipped:")
        tags = []
        for item in st.session_state.history:
            label = "Skipped" if item["answer"] == "(Skipped)" else "Answered"
            color = "#f97316" if label == "Skipped" else "#22c55e"
            tags.append(
                f"<span style='font-size:11px;padding:4px 8px;border-radius:999px;"
                f"border:1px solid #e5e7ff;background:#f9fafb;margin-right:4px;"
                f"color:{color};'>Q{item['question_no']}: {label}</span>"
            )
        st.markdown(" ".join(tags), unsafe_allow_html=True)
        st.markdown("</div>", unsafe_allow_html=True)

# ---------- Right: Scores, History, Summary ----------
with right_col:
    st.markdown('<div class="stCard">', unsafe_allow_html=True)
    st.subheader("📊 Final Evaluation & Report")
    st.write(
        "After finishing all questions, click below to evaluate all answers and "
        "generate the AI interview report."
    )

    # Button to evaluate all answers and generate final report
    if st.session_state.history and not st.session_state.summary_generated:
        if st.button("📄 Submit & Generate AI Report"):
            with st.spinner("Evaluating all answers and generating final report..."):
                # 1) Evaluate each answer (only once)
                for item in st.session_state.history:
                    if item["answer"] != "(Skipped)" and not item["evaluation"]:
                        eval_text = evaluate_answer(
                            question=item["question"],
                            answer=item["answer"],
                            role=job_role,
                            experience=experience_level,
                            skills=skills,
                        )
                        if eval_text.startswith("ERROR"):
                            item["evaluation"] = "Evaluation failed."
                            item["score"] = -1
                        else:
                            item["evaluation"] = eval_text
                            item["score"] = extract_score(eval_text)

                # 2) Generate summary based on updated history
                summary = generate_summary(
                    candidate_name=candidate_name,
                    role=job_role,
                    experience=experience_level,
                    skills=skills,
                    history=st.session_state.history,
                )

            if summary.startswith("ERROR"):
                st.error(summary)
            else:
                st.session_state.summary_text = summary
                st.session_state.summary_generated = True

    # Show scores + report after generated
    if st.session_state.summary_generated and st.session_state.summary_text:
        # Scores table
        df_rows = []
        for item in st.session_state.history:
            df_rows.append(
                {
                    "Q No": item["question_no"],
                    "Score": item["score"],
                    "Answered": "Yes" if item["answer"] != "(Skipped)" else "Skipped",
                }
            )
        if df_rows:
            df = pd.DataFrame(df_rows)
            st.markdown("**Question-wise Scores**")
            st.dataframe(df, hide_index=True, use_container_width=True)

            valid_scores = [x["score"] for x in st.session_state.history if x["score"] >= 0]
            if valid_scores:
                avg_score = sum(valid_scores) / len(valid_scores)
                st.metric("Average Score", f"{avg_score:.1f} / 10")

        # Final report
        st.markdown("#### 🧾 Final Interview Report")
        st.markdown(st.session_state.summary_text)

    st.markdown("</div>", unsafe_allow_html=True)

# ---------- Footer ----------
st.markdown("---")
st.caption(
    "AI Interview Agent – asks questions, saves answers, and at the end generates a full AI evaluation report."
)
