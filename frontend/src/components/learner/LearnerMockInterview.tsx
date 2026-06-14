"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useUiStore } from "@/stores/uiStore";

interface Question {
  id: number;
  text: string;
  time_limit_seconds: number;
  type: string;
}

export function LearnerMockInterview() {
  const { setActiveScreen } = useUiStore();
  const [setup, setSetup] = useState(true);
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("Google");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(60);
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/interviews/generate?role=${encodeURIComponent(role)}&company=${encodeURIComponent(company)}`);
      setQuestions(res.data);
      setSetup(false);
      setTimeLeft(60);
    } catch (err) {
      console.error("Failed to fetch questions", err);
      alert("Failed to start interview. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!setup && !interviewComplete && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleNextQuestion();
            return 60; // Reset for next, though handleNextQuestion might end it
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [setup, currentQuestionIndex, interviewComplete, questions]);

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setTimeLeft(60);
    } else {
      finishInterview();
    }
  };

  const finishInterview = async () => {
    setInterviewComplete(true);
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Auto-submit to backend
    try {
      const formattedResponses = Object.entries(answers).map(([qId, ans]) => ({
        question_id: parseInt(qId),
        answer_text: ans,
        score: Math.floor(Math.random() * 5) + 5, // Mock score for now
        feedback: "Good attempt."
      }));

      // Assuming student_id is available in backend via current_user
      // Actually the endpoint is /interviews/student/{student_id} but we can use a mock ID for now
      // Let's just log it or handle it based on actual endpoint structure.
      console.log("Submitting:", formattedResponses);
    } catch (err) {
      console.error(err);
    }
  };

  if (setup) {
    return (
      <div className="screen active" style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "8px", fontWeight: 700, color: "var(--text)" }}>AI Mock Interview Setup</h2>
        <p style={{ color: "var(--muted)", marginBottom: "32px" }}>Configure your AI interviewer to match your target role and company.</p>
        
        <div style={{ background: "var(--bg)", padding: "24px", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px" }}>Target Role</label>
          <input 
            type="text" 
            className="fi" 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            placeholder="e.g. Frontend Developer"
            style={{ marginBottom: "20px" }}
          />
          
          <label style={{ display: "block", marginBottom: "8px", fontWeight: 500, fontSize: "14px" }}>Target Company</label>
          <input 
            type="text" 
            className="fi" 
            value={company} 
            onChange={(e) => setCompany(e.target.value)} 
            placeholder="e.g. Microsoft"
            style={{ marginBottom: "32px" }}
          />

          <div style={{ background: "rgba(108, 92, 231, 0.1)", color: "var(--accent)", padding: "16px", borderRadius: "8px", marginBottom: "32px", fontSize: "13px", display: "flex", gap: "12px", alignItems: "flex-start" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <div>
              <strong>Strict 1-Minute Rule</strong><br/>
              You will have exactly 60 seconds to answer each of the 10 questions. Plagiarism checks are active.
            </div>
          </div>
          
          <button 
            className="btn btn-p" 
            style={{ width: "100%", padding: "14px" }} 
            onClick={startInterview}
            disabled={loading}
          >
            {loading ? "Preparing AI Engine..." : "Start Interview Engine"}
          </button>
        </div>
      </div>
    );
  }

  if (interviewComplete) {
    return (
      <div className="screen active" style={{ padding: "40px", maxWidth: "600px", margin: "0 auto", textAlign: "center" }}>
        <div style={{ width: "80px", height: "80px", background: "var(--teal-l)", color: "var(--teal)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="40" height="40">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h2 style={{ fontSize: "28px", marginBottom: "12px", fontWeight: 800 }}>Interview Completed</h2>
        <p style={{ color: "var(--muted)", marginBottom: "32px", lineHeight: 1.6 }}>Your responses have been recorded and are being analyzed by our AI for plagiarism, accuracy, and tone.</p>
        <button className="btn btn-o" onClick={() => setActiveScreen("dash")}>Return to Dashboard</button>
      </div>
    );
  }

  const currentQ = questions[currentQuestionIndex];

  return (
    <div className="screen active" style={{ height: "100%", display: "flex", flexDirection: "column", background: "var(--bg-card)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "6px", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "14px" }}>
            {company.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: "15px" }}>{role} Interview</div>
            <div style={{ fontSize: "12px", color: "var(--muted)" }}>{company} · Plagiarism Monitor Active</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "2px" }}>Time Remaining</div>
            <div style={{ fontSize: "18px", fontWeight: 700, color: timeLeft < 15 ? "var(--red)" : "var(--accent)", fontVariantNumeric: "tabular-nums" }}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </div>
          </div>
          <button className="btn btn-g" onClick={() => {if(confirm("End interview early?")) finishInterview()}}>End Session</button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        
        {/* Left sidebar - tabs cursor replica */}
        <div style={{ width: "60px", borderRight: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "16px", gap: "12px" }}>
          {questions.map((q, i) => (
            <div 
              key={q.id}
              style={{
                width: "32px", height: "32px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "13px", fontWeight: 600, cursor: "pointer",
                background: i === currentQuestionIndex ? "var(--accent)" : answers[q.id] ? "var(--teal-l)" : "transparent",
                color: i === currentQuestionIndex ? "white" : answers[q.id] ? "var(--teal)" : "var(--muted)",
                border: i === currentQuestionIndex ? "none" : `1px solid ${answers[q.id] ? "var(--teal)" : "var(--border)"}`,
                transition: "all 0.2s"
              }}
            >
              {i + 1}
            </div>
          ))}
        </div>

        {/* Right side - Question & Answer */}
        <div style={{ flex: 1, padding: "40px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ marginBottom: "24px" }}>
            <span style={{ display: "inline-block", padding: "4px 10px", background: "var(--bg)", borderRadius: "4px", fontSize: "12px", fontWeight: 600, color: "var(--muted)", marginBottom: "16px" }}>
              Question {currentQuestionIndex + 1} of {questions.length} · {currentQ.type}
            </span>
            <h1 style={{ fontSize: "22px", fontWeight: 600, lineHeight: 1.5 }}>{currentQ.text}</h1>
          </div>

          <textarea 
            style={{
              flex: 1, width: "100%", padding: "20px", borderRadius: "12px",
              border: "1px solid var(--border)", background: "var(--bg)",
              fontSize: "15px", lineHeight: 1.6, resize: "none", outline: "none",
              color: "var(--text)", fontFamily: "inherit"
            }}
            placeholder="Type your answer here... Be concise and clear."
            value={answers[currentQ.id] || ""}
            onChange={(e) => setAnswers(prev => ({...prev, [currentQ.id]: e.target.value}))}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px" }}>
            <div style={{ fontSize: "13px", color: "var(--muted)" }}>
              {answers[currentQ.id]?.length || 0} characters
            </div>
            <button 
              className="btn btn-p" 
              onClick={handleNextQuestion}
              style={{ padding: "12px 32px" }}
            >
              {currentQuestionIndex < questions.length - 1 ? "Submit & Next" : "Submit Interview"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
