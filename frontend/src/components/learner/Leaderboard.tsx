"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

type LeaderboardEntry = {
  rank: number;
  name: string;
  college: string;
  score: number;
  accuracy: number;
  avatar: string;
  trend: "up" | "down" | "same";
};

// Mock data for the leaderboard
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: "Arjun Mehta", college: "IIT Madras", score: 9850, accuracy: 94, avatar: "A", trend: "same" },
  { rank: 2, name: "Priya Sharma", college: "NIT Trichy", score: 9420, accuracy: 91, avatar: "P", trend: "up" },
  { rank: 3, name: "Rahul Verma", college: "VIT Vellore", score: 9100, accuracy: 88, avatar: "R", trend: "up" },
  { rank: 4, name: "Sneha Reddy", college: "SRM University", score: 8950, accuracy: 89, avatar: "S", trend: "down" },
  { rank: 5, name: "Kaviarasan S", college: "SNS College", score: 8840, accuracy: 86, avatar: "K", trend: "up" },
  { rank: 6, name: "Vikram Singh", college: "BITS Pilani", score: 8700, accuracy: 85, avatar: "V", trend: "down" },
  { rank: 7, name: "Ananya Patel", college: "Manipal University", score: 8550, accuracy: 83, avatar: "A", trend: "same" },
  { rank: 8, name: "Rohan Desai", college: "PSG Tech", score: 8400, accuracy: 82, avatar: "R", trend: "up" },
];

export function Leaderboard() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"national" | "college">("national");

  const leaderboardData = activeTab === "national" 
    ? MOCK_LEADERBOARD 
    : MOCK_LEADERBOARD.filter(e => e.college === "SNS College" || e.name === "Kaviarasan S");

  return (
    <div className="screen active" style={{ padding: "40px" }}>
      <div style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)" }}>Top Talent Board</h2>
          <p style={{ color: "var(--muted)", fontSize: "15px" }}>Compete with top minds across the country.</p>
        </div>
        
        <div style={{ display: "flex", background: "var(--bg)", padding: "4px", borderRadius: "8px", border: "1px solid var(--border)" }}>
          <button 
            onClick={() => setActiveTab("national")}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "6px", 
              background: activeTab === "national" ? "var(--accent)" : "transparent",
              color: activeTab === "national" ? "white" : "var(--muted)",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            National
          </button>
          <button 
            onClick={() => setActiveTab("college")}
            style={{ 
              padding: "8px 16px", 
              borderRadius: "6px", 
              background: activeTab === "college" ? "var(--accent)" : "transparent",
              color: activeTab === "college" ? "white" : "var(--muted)",
              fontWeight: 600,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            My College
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)", color: "var(--muted)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              <th style={{ padding: "16px 24px", textAlign: "center", width: "80px" }}>Rank</th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}>Student</th>
              <th style={{ padding: "16px 24px", textAlign: "left" }}>Institution</th>
              <th style={{ padding: "16px 24px", textAlign: "right" }}>Accuracy</th>
              <th style={{ padding: "16px 24px", textAlign: "right" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((entry, idx) => {
              const isCurrentUser = entry.name === user?.name || (user?.name === "Kaviarasan S" && entry.name === "Kaviarasan S");
              
              return (
                <tr 
                  key={idx} 
                  style={{ 
                    borderBottom: "1px solid var(--border)", 
                    background: isCurrentUser ? "var(--accent-l)" : "transparent",
                    transition: "background 0.2s"
                  }}
                >
                  <td style={{ padding: "16px 24px", textAlign: "center", fontWeight: 800, color: entry.rank <= 3 ? "var(--accent)" : "var(--muted)", fontSize: "16px" }}>
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                  </td>
                  <td style={{ padding: "16px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "var(--accent)", border: "1px solid var(--border)" }}>
                        {entry.avatar}
                      </div>
                      <div style={{ fontWeight: 600, color: isCurrentUser ? "var(--accent)" : "var(--text)" }}>
                        {entry.name}
                        {isCurrentUser && <span style={{ marginLeft: "8px", fontSize: "10px", padding: "2px 6px", background: "var(--accent)", color: "white", borderRadius: "4px" }}>YOU</span>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px 24px", color: "var(--muted)", fontSize: "14px" }}>
                    {entry.college}
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 600, color: entry.accuracy >= 90 ? "#16a34a" : entry.accuracy >= 80 ? "var(--amber)" : "var(--text)" }}>
                    {entry.accuracy}%
                  </td>
                  <td style={{ padding: "16px 24px", textAlign: "right", fontWeight: 700, fontSize: "15px", color: "var(--text)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
                      {entry.score.toLocaleString()}
                      {entry.trend === "up" && <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" width="14" height="14"><polyline points="18 15 12 9 6 15"></polyline></svg>}
                      {entry.trend === "down" && <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" width="14" height="14"><polyline points="6 9 12 15 18 9"></polyline></svg>}
                      {entry.trend === "same" && <svg viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2.5" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"></line></svg>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
