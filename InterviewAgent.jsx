// Filename: InterviewAgent.jsx
import React, { useState } from "react";

const InterviewAgent = () => {
  // --------- Candidate & job info ---------
  const [candidateName, setCandidateName] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Fresher");
  const [interviewType, setInterviewType] = useState("Mixed");
  const [skills, setSkills] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  // Resume upload
  const [resumeFile, setResumeFile] = useState(null);
  const [isExtractingSkills, setIsExtractingSkills] = useState(false);

  // Interview flow
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionNo, setCurrentQuestionNo] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [qaHistory, setQaHistory] = useState([]); // [{questionNo, question, answer}]
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Final report
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [scoresTable, setScoresTable] = useState([]); // [{questionNo, score, answered}]
  const [averageScore, setAverageScore] = useState(null);
  const [finalReport, setFinalReport] = useState("");
  const [error, setError] = useState("");

  // --------- Helpers ---------
  const isJobReady = candidateName.trim() && jobRole.trim() && skills.trim();

  // TODO: Replace with real API call for resume skill extraction
  const handleExtractSkills = async () => {
    if (!resumeFile) return;
    setIsExtractingSkills(true);
    setError("");

    try {
      // Example real call:
      // const formData = new FormData();
      // formData.append("resume", resumeFile);
      // const res = await fetch("/api/interview/extract-skills", {
      //   method: "POST",
      //   body: formData,
      // });
      // const data = await res.json();
      // setSkills(data.skills);

      // TEMP demo placeholder
      setTimeout(() => {
        setSkills("Python, SQL, Data Structures, OOP, HTML, CSS, JavaScript");
        setIsExtractingSkills(false);
      }, 800);
    } catch (e) {
      setError("Failed to extract skills. Please try again.");
      setIsExtractingSkills(false);
    }
  };

  // TODO: Replace with real backend call to fetch next question
  const fetchNextQuestion = async (questionNo) => {
    setIsLoadingQuestion(true);
    setError("");
    setCurrentAnswer("");

    try {
      // Example real call:
      // const res = await fetch("/api/interview/next-question", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     candidateName,
      //     jobRole,
      //     experienceLevel,
      //     interviewType,
      //     skills,
      //     questionNo,
      //   }),
      // });
      // const data = await res.json();
      // setCurrentQuestion(data.question);

      // TEMP demo questions
      const demoQuestions = [
        "Tell me about a project where you used Python to solve a real-world problem.",
        "How do you approach debugging and troubleshooting in your code?",
        "Describe a situation where you worked with a dataset and identified patterns.",
        "What is the difference between a list and a tuple in Python?",
        "Describe a time you worked in a team and handled a conflict or challenge.",
      ];
      const index = (questionNo - 1) % demoQuestions.length;
      setCurrentQuestion(demoQuestions[index]);
      setCurrentQuestionNo(questionNo);
    } catch (e) {
      setError("Failed to fetch question. Please try again.");
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  const handleStartInterview = async () => {
    if (!isJobReady) {
      setError("Please fill candidate info, job role, and skills before starting.");
      return;
    }
    setError("");
    setInterviewStarted(true);
    setQaHistory([]);
    setFinalReport("");
    setScoresTable([]);
    setAverageScore(null);
    await fetchNextQuestion(1);
  };

  const handleSaveAnswerAndNext = async () => {
    if (!currentAnswer.trim()) {
      setError("Please enter an answer or use Skip.");
      return;
    }
    setError("");

    const newHistory = [
      ...qaHistory,
      {
        questionNo: currentQuestionNo,
        question: currentQuestion,
        answer: currentAnswer.trim(),
      },
    ];
    setQaHistory(newHistory);

    if (currentQuestionNo < numQuestions) {
      await fetchNextQuestion(currentQuestionNo + 1);
    } else {
      setCurrentQuestion("");
    }
  };

  const handleSkipQuestion = async () => {
    setError("");
    const newHistory = [
      ...qaHistory,
      {
        questionNo: currentQuestionNo,
        question: currentQuestion,
        answer: "(Skipped)",
      },
    ];
    setQaHistory(newHistory);

    if (currentQuestionNo < numQuestions) {
      await fetchNextQuestion(currentQuestionNo + 1);
    } else {
      setCurrentQuestion("");
    }
  };

  // TODO: Replace with real backend call to evaluate all answers & generate report
  const handleSubmitAndGenerateReport = async () => {
    if (qaHistory.length === 0) {
      setError("No answers recorded. Please answer at least one question.");
      return;
    }

    setIsSubmittingReport(true);
    setError("");

    try {
      // Example real call:
      // const res = await fetch("/api/interview/generate-report", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     candidateName,
      //     jobRole,
      //     experienceLevel,
      //     interviewType,
      //     skills,
      //     qaHistory,
      //   }),
      // });
      // const data = await res.json();
      // setScoresTable(data.scores);
      // setAverageScore(data.averageScore);
      // setFinalReport(data.report);

      // TEMP: fake scoring & report
      const demoScores = qaHistory.map((item) => ({
        questionNo: item.questionNo,
        score: item.answer === "(Skipped)" ? -1 : 8,
        answered: item.answer === "(Skipped)" ? "Skipped" : "Yes",
      }));
      const validScores = demoScores.filter((s) => s.score >= 0).map((s) => s.score);
      const avg =
        validScores.length > 0
          ? validScores.reduce((a, b) => a + b, 0) / validScores.length
          : null;

      setScoresTable(demoScores);
      setAverageScore(avg);
      setFinalReport(
        `Overall, ${candidateName || "the candidate"} shows strong fundamentals for the role of ${
          jobRole || "the position"
        }.\n\nKey strengths include communication, clarity of thought, and relevant technical knowledge.\nSome answers could be more structured and include concrete examples, but overall performance is promising.\n\nRecommendation: Suitable for an internship / entry-level opportunity with guidance and mentorship.`
      );
    } catch (e) {
      setError("Failed to generate report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleReset = () => {
    setInterviewStarted(false);
    setCurrentQuestionNo(0);
    setCurrentQuestion("");
    setCurrentAnswer("");
    setQaHistory([]);
    setScoresTable([]);
    setAverageScore(null);
    setFinalReport("");
    setError("");
  };

  // --------- UI ---------
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>AI Interview Agent</h1>
          <p style={styles.subtitle}>
            AI generates interview questions, you record answers, and at the end get one detailed AI-based report.
          </p>
        </div>
      </header>

      <main style={styles.main}>
        {/* Left column: candidate + job info */}
        <section style={styles.leftColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👤 Candidate & Job Info</h2>

            <label style={styles.label}>
              Candidate Name
              <input
                style={styles.input}
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="e.g., Pavan"
              />
            </label>

            <label style={styles.label}>
              Job Role
              <input
                style={styles.input}
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="e.g., Python Developer Intern"
              />
            </label>

            <label style={styles.label}>
              Experience Level
              <select
                style={styles.select}
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option>Fresher</option>
                <option>0–1 years</option>
                <option>1–3 years</option>
                <option>3–5 years</option>
                <option>5+ years</option>
              </select>
            </label>

            <label style={styles.label}>
              Interview Type
              <select
                style={styles.select}
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
              >
                <option>Technical</option>
                <option>HR / Behavioral</option>
                <option>Mixed</option>
              </select>
            </label>

            <label style={styles.label}>
              Number of Questions
              <input
                type="number"
                min={3}
                max={10}
                style={styles.input}
                value={numQuestions}
                onChange={(e) =>
                  setNumQuestions(
                    Math.min(10, Math.max(3, Number(e.target.value) || 3))
                  )
                }
              />
            </label>
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📄 Resume & Skills</h2>

            <label style={styles.label}>
              Upload Resume (PDF or TXT)
              <input
                type="file"
                accept=".pdf,.txt"
                style={styles.fileInput}
                onChange={(e) => setResumeFile(e.target.files[0] || null)}
              />
            </label>

            <button
              style={{
                ...styles.buttonSecondary,
                opacity: resumeFile ? 1 : 0.6,
                cursor: resumeFile ? "pointer" : "not-allowed",
              }}
              disabled={!resumeFile || isExtractingSkills}
              onClick={handleExtractSkills}
            >
              {isExtractingSkills ? "Extracting skills..." : "✨ Extract Skills from Resume"}
            </button>

            <label style={{ ...styles.label, marginTop: 16 }}>
              Key Skills / Technologies
              <textarea
                style={styles.textarea}
                rows={3}
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g., Python, SQL, Data Structures, Django, REST APIs"
              />
            </label>

            <p style={styles.helpText}>
              These skills will be used to generate relevant questions and final evaluation.
            </p>
          </div>
        </section>

        {/* Middle column: interview flow */}
        <section style={styles.middleColumn}>
          <div style={styles.card}>
            <div style={styles.cardHeaderRow}>
              <h2 style={styles.cardTitle}>🎯 Interview Flow</h2>
              {interviewStarted && (
                <span style={styles.badge}>
                  Q {currentQuestionNo || "-"} / {numQuestions}
                </span>
              )}
            </div>

            {!interviewStarted && (
              <p style={styles.helpText}>
                Fill in the candidate & job details, then click{" "}
                <strong>Start Interview</strong> to begin.
              </p>
            )}

            <div style={styles.buttonRow}>
              <button style={styles.buttonPrimary} onClick={handleStartInterview}>
                ▶️ Start / Continue Interview
              </button>
              <button style={styles.buttonGhost} onClick={handleReset}>
                🔄 Reset
              </button>
            </div>

            {interviewStarted && (
              <>
                {currentQuestion ? (
                  <>
                    <div style={styles.questionBlock}>
                      <div style={styles.questionLabel}>Question {currentQuestionNo}</div>
                      <p style={styles.questionText}>{currentQuestion}</p>
                    </div>

                    <label style={styles.label}>
                      Candidate&apos;s Answer
                      <textarea
                        style={styles.textarea}
                        rows={6}
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        placeholder="Type the candidate's response here..."
                      />
                    </label>

                    <div style={styles.buttonRow}>
                      <button
                        style={styles.buttonPrimary}
                        onClick={handleSaveAnswerAndNext}
                        disabled={isLoadingQuestion}
                      >
                        💾 Save Answer & Next
                      </button>
                      <button
                        style={styles.buttonSecondary}
                        onClick={handleSkipQuestion}
                        disabled={isLoadingQuestion}
                      >
                        ⏭ Skip Question
                      </button>
                    </div>

                    {isLoadingQuestion && (
                      <p style={styles.helpText}>Loading next question...</p>
                    )}
                  </>
                ) : (
                  <p style={styles.helpHighlight}>
                    All questions finished. Go to <strong>Final Evaluation & Report</strong> on
                    the right and click <strong>Submit & Generate AI Report</strong>.
                  </p>
                )}
              </>
            )}
          </div>

          {qaHistory.length > 0 && (
            <div style={styles.card}>
              <h3 style={styles.cardSubtitle}>🗂 Answered Questions</h3>
              <p style={styles.helpText}>
                Quick overview of what has been answered or skipped.
              </p>
              <div style={styles.tagContainer}>
                {qaHistory.map((item) => (
                  <div key={item.questionNo} style={styles.tag}>
                    Q{item.questionNo}:{" "}
                    {item.answer === "(Skipped)" ? "Skipped" : "Answered"}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Right column: final evaluation */}
        <section style={styles.rightColumn}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 Final Evaluation & Report</h2>
            <p style={styles.helpText}>
              After finishing all questions, click below to evaluate all answers and generate
              the AI interview report.
            </p>

            <button
              style={{
                ...styles.buttonPrimary,
                width: "100%",
                opacity: qaHistory.length === 0 ? 0.6 : 1,
                cursor: qaHistory.length === 0 ? "not-allowed" : "pointer",
              }}
              disabled={qaHistory.length === 0 || isSubmittingReport}
              onClick={handleSubmitAndGenerateReport}
            >
              {isSubmittingReport ? "Generating report..." : "📄 Submit & Generate AI Report"}
            </button>

            {scoresTable.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3 style={styles.cardSubtitle}>Question-wise Scores</h3>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Q No</th>
                      <th style={styles.th}>Score</th>
                      <th style={styles.th}>Answered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoresTable.map((row) => (
                      <tr key={row.questionNo}>
                        <td style={styles.td}>{row.questionNo}</td>
                        <td style={styles.td}>
                          {row.score >= 0 ? `${row.score}/10` : "-"}
                        </td>
                        <td style={styles.td}>{row.answered}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {averageScore !== null && (
                  <div style={styles.metricBox}>
                    <span style={styles.metricLabel}>Average Score</span>
                    <span style={styles.metricValue}>
                      {averageScore.toFixed(1)} / 10
                    </span>
                  </div>
                )}
              </div>
            )}

            {finalReport && (
              <div style={{ marginTop: 20 }}>
                <h3 style={styles.cardSubtitle}>🧾 Final Interview Report</h3>
                <pre style={styles.reportBox}>{finalReport}</pre>
              </div>
            )}
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}
        </section>
      </main>

      <footer style={styles.footer}>
        Built for the AI Agent Development Challenge – Interview Agent (Ask questions, capture
        answers, final AI report).
      </footer>
    </div>
  );
};

// --------- Simple inline styles (no external CSS needed) ---------
const styles = {
  page: {
    fontFamily: '"Inter", system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fb, #eef3ff)",
    color: "#1f2933",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "16px 32px",
    borderBottom: "1px solid rgba(0,0,0,0.05)",
    backgroundColor: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  title: {
    fontSize: "24px",
    fontWeight: 700,
    margin: 0,
  },
  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
    marginTop: 4,
  },
  main: {
    display: "grid",
    gridTemplateColumns:
      "minmax(280px, 320px) minmax(380px, 1.4fr) minmax(260px, 320px)",
    gap: "16px",
    padding: "16px 24px",
    flex: 1,
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  middleColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "16px 18px",
    boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
    border: "1px solid rgba(15,23,42,0.03)",
  },
  cardTitle: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "0 0 8px 0",
  },
  cardSubtitle: {
    fontSize: "14px",
    fontWeight: 600,
    margin: "0 0 6px 0",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    fontWeight: 500,
    marginTop: 8,
    gap: 4,
  },
  input: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "13px",
    outline: "none",
  },
  select: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "13px",
    outline: "none",
    backgroundColor: "#ffffff",
  },
  fileInput: {
    fontSize: "13px",
    marginTop: 4,
  },
  textarea: {
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #d1d5db",
    fontSize: "13px",
    resize: "vertical",
    minHeight: "80px",
    outline: "none",
  },
  helpText: {
    fontSize: "12px",
    color: "#6b7280",
    marginTop: 6,
  },
  helpHighlight: {
    fontSize: "13px",
    color: "#374151",
    marginTop: 10,
    padding: "8px 10px",
    borderRadius: "8px",
    backgroundColor: "#eff6ff",
    border: "1px dashed #bfdbfe",
  },
  buttonRow: {
    display: "flex",
    gap: "8px",
    marginTop: 12,
    flexWrap: "wrap",
  },
  buttonPrimary: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.25)",
  },
  buttonSecondary: {
    backgroundColor: "#f3f4f6",
    color: "#111827",
    border: "none",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },
  buttonGhost: {
    backgroundColor: "transparent",
    color: "#4b5563",
    border: "1px solid #e5e7eb",
    padding: "8px 14px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 500,
    cursor: "pointer",
  },
  cardHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
    marginBottom: 8,
  },
  badge: {
    fontSize: "11px",
    backgroundColor: "#eff6ff",
    color: "#1d4ed8",
    padding: "4px 8px",
    borderRadius: "999px",
    border: "1px solid #bfdbfe",
  },
  questionBlock: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
  },
  questionLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#6b7280",
    marginBottom: 4,
  },
  questionText: {
    fontSize: "14px",
    margin: 0,
    color: "#111827",
  },
  tagContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginTop: 8,
  },
  tag: {
    fontSize: "11px",
    padding: "4px 8px",
    backgroundColor: "#f3f4ff",
    borderRadius: "999px",
    border: "1px solid #e5e7ff",
    color: "#4338ca",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: 8,
    fontSize: "12px",
  },
  th: {
    textAlign: "left",
    padding: "6px 8px",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 600,
  },
  td: {
    padding: "6px 8px",
    borderBottom: "1px solid #f3f4f6",
  },
  metricBox: {
    marginTop: 10,
    padding: "8px 10px",
    borderRadius: "12px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: {
    fontSize: "12px",
    color: "#166534",
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: 700,
    color: "#15803d",
  },
  reportBox: {
    marginTop: 6,
    padding: "10px 12px",
    borderRadius: "12px",
    backgroundColor: "#f9fafb",
    border: "1px solid #e5e7eb",
    fontSize: "12px",
    whiteSpace: "pre-wrap",
  },
  errorBox: {
    marginTop: 8,
    padding: "8px 10px",
    borderRadius: "10px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#b91c1c",
    fontSize: "12px",
  },
  footer: {
    padding: "8px 16px",
    fontSize: "11px",
    color: "#9ca3af",
    textAlign: "center",
    borderTop: "1px solid rgba(0,0,0,0.03)",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
};

export default InterviewAgent;
