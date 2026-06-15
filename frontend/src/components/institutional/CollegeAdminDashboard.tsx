"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export function CollegeAdminDashboard() {
  const { user } = useAuthStore();
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [message, setMessage] = useState("");

  const fetchFaculty = async () => {
    try {
      // In a real app we would have an endpoint specifically for college admins to fetch their faculty.
      // For now we will just use a generic call or mock it if the endpoint doesn't exist.
      // We will assume the endpoint is /users/faculty (we may need to create this in backend if it doesn't exist).
      const res = await api.get("/users");
      const faculty = res.data.filter((u: User) => u.role === "faculty");
      setFacultyList(faculty);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, []);

  const handleAddFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      // Register the faculty directly via the users endpoint
      await api.post("/users/", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "faculty",
        college_id: user?.college_id
      });
      setMessage("Faculty account created successfully!");
      setFormData({ name: "", email: "", password: "" });
      fetchFaculty();
    } catch (err: any) {
      setMessage(err.response?.data?.detail || "Failed to create faculty");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="screen active" style={{ padding: "40px" }}>
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)" }}>Institution Dashboard</h2>
        <p style={{ color: "var(--muted)" }}>Manage your faculty and view institutional metrics.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        {/* Add Faculty Form */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>Add New Faculty</h3>
          {message && <div style={{ padding: "10px", marginBottom: "16px", background: "var(--bg)", borderRadius: "8px", color: "var(--accent)", fontSize: "14px" }}>{message}</div>}
          <form onSubmit={handleAddFaculty}>
            <div style={{ marginBottom: "16px" }}>
              <label className="lbl">Faculty Name</label>
              <input type="text" className="fi" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label className="lbl">Email Address</label>
              <input type="email" className="fi" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label className="lbl">Initial Password</label>
              <input type="text" className="fi" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="e.g. Faculty123" />
            </div>
            <button type="submit" className="btn btn-p" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Creating..." : "Create Faculty Account"}
            </button>
          </form>
        </div>

        {/* Faculty List */}
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px", color: "var(--text)" }}>Registered Faculty</h3>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "14px" }}>
                <th style={{ padding: "12px 0" }}>Name</th>
                <th style={{ padding: "12px 0" }}>Email</th>
                <th style={{ padding: "12px 0" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {facultyList.map(faculty => (
                <tr key={faculty.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 0", fontWeight: 500 }}>{faculty.name}</td>
                  <td style={{ padding: "12px 0", color: "var(--muted)" }}>{faculty.email}</td>
                  <td style={{ padding: "12px 0" }}>
                    <span style={{ padding: "4px 8px", background: "var(--green-l, #e6f4ea)", color: "var(--green, #1e8e3e)", borderRadius: "4px", fontSize: "12px", fontWeight: 600 }}>Active</span>
                  </td>
                </tr>
              ))}
              {facultyList.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: "24px 0", textAlign: "center", color: "var(--muted)" }}>No faculty members found. Add one to get started.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
