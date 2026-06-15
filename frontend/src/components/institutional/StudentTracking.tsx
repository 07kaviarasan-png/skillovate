"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

type Student = {
  id: number;
  name: string;
  email: string;
  department?: string;
  status: string;
  created_at?: string;
};

export function StudentTracking() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/students?search=${search}`);
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="screen active" style={{ padding: "40px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "8px" }}>Student Tracking</h2>
        <p style={{ color: "var(--muted)", fontSize: "15px" }}>Monitor all enrolled students and their progress.</p>
      </div>

      <div className="card" style={{ padding: "24px" }}>
        <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <input
            type="text"
            className="fi"
            placeholder="Search by name, email, or roll number..."
            style={{ marginBottom: 0, flex: 1 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-p" style={{ padding: "0 24px" }}>Search</button>
        </form>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>Loading students...</div>
        ) : (
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "13px" }}>
                <th style={{ padding: "12px 8px" }}>Name</th>
                <th style={{ padding: "12px 8px" }}>Email</th>
                <th style={{ padding: "12px 8px" }}>Department</th>
                <th style={{ padding: "12px 8px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "12px 8px", fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: "12px 8px", color: "var(--muted)", fontSize: "14px" }}>{s.email}</td>
                  <td style={{ padding: "12px 8px" }}>{s.department || "—"}</td>
                  <td style={{ padding: "12px 8px" }}>
                    <span style={{ padding: "4px 10px", background: s.status === "approved" ? "#e6f4ea" : "#fef3c7", color: s.status === "approved" ? "#1e8e3e" : "#b45309", borderRadius: "6px", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>{s.status}</span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={4} style={{ padding: "24px", textAlign: "center", color: "var(--muted)" }}>No students found.</td></tr>
              )}
            </tbody>
          </table>
        )}
        <div style={{ marginTop: "12px", fontSize: "13px", color: "var(--muted)" }}>Total: {students.length} students</div>
      </div>
    </div>
  );
}
