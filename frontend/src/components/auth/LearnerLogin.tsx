"use client";

import React, { useState } from "react";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

const colleges = [
  { name: "PSG College of Technology", code: "PSG-COIM-2024", enabled: true },
  { name: "Anna University", code: "ANNA-CHN-2024", enabled: true },
  { name: "CIT Coimbatore", code: "CIT-COIM-2024", enabled: false },
  { name: "SASTRA Deemed University", code: "SASTRA-TJR-2024", enabled: false },
];

export function LearnerLogin() {
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      if (!selectedCollege) {
        setError("Please select an institution");
        setLoading(false);
        return;
      }
      if (!rollNumber || !password) {
        setError("Enter roll number and password");
        setLoading(false);
        return;
      }
      
      const payload = { studentId: rollNumber, password, collegeId: selectedCollege };
      const res = await api.post("/auth/login", payload);

      const { user, access_token } = res.data;
      login(
        {
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          collegeId: user.collegeId,
        },
        access_token
      );
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: any } } };
      let errMsg = "Invalid credentials. Please try again.";
      if (error?.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errMsg = error.response.data.detail.map((e: any) => e.msg).join(", ");
        } else if (typeof error.response.data.detail === "string") {
          errMsg = error.response.data.detail;
        }
      }
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplitLayout type="learner">
      <div className="login-box-auth">
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <img
            src="/legacy/logo.png"
            alt="Skillovate"
            style={{ height: "40px", marginBottom: "20px" }}
          />
          <h2 style={{ fontSize: "24px", color: "var(--text)", fontWeight: 700, marginBottom: "8px" }}>
            Learner Login
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Sign in to access your dashboard
          </p>
        </div>

        {error && (
          <div className="auth-warn" style={{ display: "block", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <div className="l-panel active">
          <label className="lbl">Select Institution</label>
          <select
            className="fi"
            style={{ width: "100%", marginBottom: "12px" }}
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
          >
            <option value="">Choose your college...</option>
            {colleges.map((c) => (
              <option key={c.code} value={c.name} disabled={!c.enabled}>
                {c.name}
              </option>
            ))}
          </select>
          
          <label className="lbl">Roll Number</label>
          <input
            type="text"
            className="fi"
            placeholder="e.g. 22CS001"
            style={{ textTransform: "uppercase", marginBottom: "12px" }}
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value)}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <label className="lbl" style={{ marginBottom: 0 }}>Password</label>
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
          <button className="btn-primary" style={{ width: "100%" }} onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in..." : "Sign In to Portal"}
          </button>
        </div>
      </div>
    </AuthSplitLayout>
  );
}
