"use client";

import React, { useState } from "react";
import { api } from "@/lib/api";

export function FacultyDashboard() {
  const [studentForm, setStudentForm] = useState({ name: "", email: "", password: "" });
  const [pwdForm, setPwdForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/register", {
        name: studentForm.name,
        email: studentForm.email,
        password: studentForm.password,
        role: "student"
      });
      setMessage("Student account created successfully!");
      setStudentForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed to create student");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage("");
    try {
      await api.put("/auth/change-password", {
        current_password: pwdForm.currentPassword,
        new_password: pwdForm.newPassword
      });
      setPwdMessage("Password changed successfully!");
      setPwdForm({ currentPassword: "", newPassword: "" });
    } catch (err: any) {
      setPwdMessage(err.response?.data?.detail || "Failed to change password. Make sure current password is correct and new password contains letters and numbers.");
    }
  };

  return (
    <div className="screen active" style={{ padding: "40px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)" }}>Faculty Portal</h2>
        <p style={{ color: "var(--muted)" }}>Manage your account and add institutional students.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Create Student Form */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>Add Student</h3>
          {message && <div style={{ padding: "10px", marginBottom: "16px", background: "var(--bg)", borderRadius: "8px", color: "var(--accent)", fontSize: "14px" }}>{message}</div>}
          <form onSubmit={handleAddStudent}>
            <div style={{ marginBottom: "16px" }}>
              <label className="lbl">Student Name</label>
              <input type="text" className="fi" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} required />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label className="lbl">Student Email</label>
              <input type="email" className="fi" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} required />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="lbl">Initial Password</label>
              <input type="text" className="fi" value={studentForm.password} onChange={e => setStudentForm({...studentForm, password: e.target.value})} required placeholder="e.g. Student123" />
            </div>
            <button type="submit" className="btn btn-p" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating..." : "Create Student Account"}
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>Change Password</h3>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "16px" }}>
            Update the temporary password provided by your institution admin to a secure, personal password.
          </p>
          {pwdMessage && <div style={{ padding: "10px", marginBottom: "16px", background: "var(--bg)", borderRadius: "8px", color: "var(--accent)", fontSize: "14px" }}>{pwdMessage}</div>}
          <form onSubmit={handleChangePassword}>
            <div style={{ marginBottom: "16px" }}>
              <label className="lbl">Current Password</label>
              <input type="password" className="fi" value={pwdForm.currentPassword} onChange={e => setPwdForm({...pwdForm, currentPassword: e.target.value})} required />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="lbl">New Password</label>
              <input type="password" className="fi" value={pwdForm.newPassword} onChange={e => setPwdForm({...pwdForm, newPassword: e.target.value})} required placeholder="Must contain letters and numbers" />
            </div>
            <button type="submit" className="btn btn-g" style={{ width: "100%" }}>
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
