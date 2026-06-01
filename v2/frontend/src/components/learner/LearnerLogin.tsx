"use client";

import React, { useState } from "react";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { useAuthStore } from "@/stores/authStore";

export function LearnerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuthStore();

  const handleLogin = async () => {
    setError("");
    // Simulation of login for now as per demo credentials in original HTML
    if (password === "student123") {
      login(
        {
          _id: "demo-student-id",
          email: email || "student@gmail.com",
          name: email.split("@")[0] || "Demo Student",
          role: "student",
        },
        "demo-token"
      );
    } else {
      setError("Invalid credentials. Try student123");
    }
  };

  return (
    <AuthSplitLayout>
      <div className="lp-card">
        <div className="lp-heading">
          <h2>Learner Login</h2>
          <p>Sign in to continue your aptitude journey</p>
        </div>
        <div className="linfo">
          <strong>Demo credentials:</strong> Any Gmail &amp; password <strong>student123</strong>
        </div>
        <label className="lbl">Gmail Address</label>
        <input
          type="email"
          className="fi"
          placeholder="name@gmail.com"
          style={{ marginBottom: "12px" }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <label className="lbl">Password</label>
          <a href="#" style={{ fontSize: "12px", marginBottom: "6px", color: "var(--accent)" }}>
            Forgot Password?
          </a>
        </div>
        <input
          type="password"
          className="fi"
          placeholder="••••••••"
          style={{ marginBottom: "14px" }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        {error && (
          <div className="auth-warn" style={{ display: "block", marginBottom: "12px" }}>
            {error}
          </div>
        )}
        <button className="l-submit l-submit-blue" onClick={handleLogin}>
          Sign In to Learner Portal
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>
        <div style={{ margin: "15px 0 10px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
          <span style={{ fontSize: "11px", color: "var(--muted)", textTransform: "uppercase" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
        </div>
        <div className="google-login-btn-container" style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          {/* Google Login Placeholder */}
        </div>
        <div className="l-footer">
          No account? <a href="#">Sign up free</a>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
