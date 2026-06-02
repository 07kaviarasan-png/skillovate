"use client";

import React, { useState } from "react";
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

const colleges = [
  { name: "PSG College of Technology", code: "PSG-COIM-2024", students: 142, enabled: true },
  { name: "Anna University", code: "ANNA-CHN-2024", students: 89, enabled: true },
  { name: "CIT Coimbatore", code: "CIT-COIM-2024", students: 0, enabled: false },
  { name: "SASTRA Deemed University", code: "SASTRA-TJR-2024", students: 56, enabled: false },
];

type PortalRole = "student" | "faculty" | "admin";

export function InstitutionalLogin() {
  const [activeTab, setActiveTab] = useState<PortalRole>("student");
  const [selectedCollege, setSelectedCollege] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      if (activeTab === "student") {
        if (!selectedCollege) {
          setError("Please select an institution");
          setLoading(false);
          return;
        }
        if (!rollNumber) {
          setError("Enter roll number");
          setLoading(false);
          return;
        }
        formData.append("username", rollNumber);
      } else {
        if (!email || !password) {
          setError("Enter credentials");
          setLoading(false);
          return;
        }
        formData.append("username", email);
      }
      formData.append("password", password);

      const res = await api.post("/auth/login", formData);

      const { user, access_token } = res.data;
      login(
        {
          _id: user._id || user.id,
          email: user.email,
          name: user.name || user.full_name,
          role: user.role,
          college_name: selectedCollege || undefined,
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
    <AuthSplitLayout>
      <div className="lp-card" style={{ maxWidth: "420px" }}>
        <div className="lp-heading" style={{ textAlign: "center", marginBottom: "24px" }}>
          <img
            src="/logo.png"
            alt="SKILLOVATE"
            style={{ height: "84px", marginBottom: "16px", display: "inline-block", mixBlendMode: "multiply" }}
          />
          <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text)", marginBottom: "4px" }}>Welcome Back</h2>
          <p style={{ color: "var(--muted)", fontSize: "13px" }}>Sign in to your institutional account</p>
        </div>

        <div className="l-tabs">
          <button
            className={`l-tab ${activeTab === "student" ? "active" : ""}`}
            onClick={() => setActiveTab("student")}
          >
            Learner
          </button>
          <button
            className={`l-tab ${activeTab === "faculty" ? "active" : ""}`}
            onClick={() => setActiveTab("faculty")}
          >
            Faculty
          </button>
          <button
            className={`l-tab ${activeTab === "admin" ? "active" : ""}`}
            onClick={() => setActiveTab("admin")}
          >
            Admin
          </button>
        </div>

        {activeTab === "student" && (
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
              <label className="lbl">Password</label>
              <a href="#" style={{ fontSize: "11px", marginBottom: "6px", color: "var(--accent)" }}>
                -?
              </a>
            </div>
            <input
              type="password"
              className="fi"
              placeholder="••••••••"
              style={{ marginBottom: "6px" }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
            <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "14px", paddingLeft: "4px" }}>
              Default password is your Roll Number (lowercase)
            </div>
          </div>
        )}

        {(activeTab === "faculty" || activeTab === "admin") && (
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
            <label className="lbl">{activeTab === "faculty" ? "Staff Email" : "Admin Email"}</label>
            <input
              type="email"
              className="fi"
              placeholder="staff@college.edu"
              style={{ marginBottom: "12px" }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <label className="lbl">Password</label>
              <a href="#" style={{ fontSize: "11px", marginBottom: "6px", color: "var(--accent)" }}>
                -?
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
          </div>
        )}

        {error && (
          <div className="auth-warn" style={{ display: "block", marginBottom: "12px" }}>
            {error}
          </div>
        )}

        <button className="l-submit l-submit-blue" onClick={handleLogin}>
          Sign In to Institutional Portal
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            <polyline points="9,18 15,12 9,6" />
          </svg>
        </button>

        <div className="l-footer" style={{ marginTop: "16px", textAlign: "center" }}>
          {activeTab === "faculty" ? (
            <>
              New Faculty? <a href="#">Create Account</a>
            </>
          ) : activeTab === "admin" ? (
            <>
              Partner with us? <a href="#">Contact Sales</a>
            </>
          ) : (
            <>
              Not your portal? <a href="/learner">Learner Portal</a>
            </>
          )}
        </div>
      </div>
    </AuthSplitLayout>
  );
}
