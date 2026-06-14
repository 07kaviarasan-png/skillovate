"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { CollegeAdminLogin } from "@/components/auth/CollegeAdminLogin";
import { FacultyLogin } from "@/components/auth/FacultyLogin";
import { InstitutionalStudentLogin } from "@/components/auth/InstitutionalStudentLogin";
import { LearnerShell } from "@/components/layout/LearnerShell"; 
import { AuthSplitLayout } from "@/components/layout/AuthSplitLayout";
import { PlatformChat } from "@/components/shared/PlatformChat";
import { useEffect, useState } from "react";
import { InstitutionalApproval } from "@/components/institutional/InstitutionalApproval";

type InstitutionalRole = "none" | "admin" | "faculty" | "student";

export default function InstitutionalPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { activeScreen, setActiveScreen } = useUiStore();
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState<InstitutionalRole>("none");

  useEffect(() => {
    setMounted(true);
    if (activeScreen === "dash") {
      setActiveScreen("security");
    }
  }, [activeScreen, setActiveScreen]);

  if (!mounted) return null;

  // If they are not authenticated, show the Hub or the selected login
  if (!isAuthenticated) {
    if (selectedRole === "admin") return <CollegeAdminLogin onBack={() => setSelectedRole("none")} />;
    if (selectedRole === "faculty") return <FacultyLogin onBack={() => setSelectedRole("none")} />;
    if (selectedRole === "student") return <InstitutionalStudentLogin onBack={() => setSelectedRole("none")} />;
    
    // The Hub
    return (
      <AuthSplitLayout>
        <div className="lp-card">
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <img src="/logo.png" alt="Skillovate" style={{ height: "48px", marginBottom: "24px" }} />
            <h2 style={{ fontSize: "28px", color: "var(--text)", fontWeight: 800, marginBottom: "12px" }}>
              Institutional Portal
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "15px" }}>
              Select your role to access your dashboard
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <button 
              onClick={() => setSelectedRole("admin")}
              style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--accent)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ background: "var(--accent-l)", color: "var(--accent)", padding: "12px", borderRadius: "12px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "4px" }}>Institution Admin</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>Manage placements, faculty, and reports</div>
              </div>
            </button>

            <button 
              onClick={() => setSelectedRole("faculty")}
              style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--purple)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ background: "var(--purple-l)", color: "var(--purple)", padding: "12px", borderRadius: "12px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "4px" }}>Faculty</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>Monitor student progress and assign tests</div>
              </div>
            </button>

            <button 
              onClick={() => setSelectedRole("student")}
              style={{ padding: "20px", display: "flex", alignItems: "center", gap: "16px", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", textAlign: "left" }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--teal)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--border)"}
            >
              <div style={{ background: "var(--teal-l)", color: "var(--teal)", padding: "12px", borderRadius: "12px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "16px", color: "var(--text)", marginBottom: "4px" }}>Institutional Student</div>
                <div style={{ fontSize: "13px", color: "var(--muted)" }}>Access your college-assigned learning path</div>
              </div>
            </button>
          </div>
        </div>
      </AuthSplitLayout>
    );
  }

  // Once authenticated (any institutional role), they land in the Shell
  return (
    <LearnerShell>
      {activeScreen === "security" && <InstitutionalApproval />}
      {activeScreen === "chat" && <PlatformChat />}
      {activeScreen === "dash" && (
        <div style={{ padding: "40px" }}>
          <h2>Welcome, {user?.name}</h2>
          <p>Role: {user?.role}</p>
          <p>Institutional Dashboard is under migration.</p>
        </div>
      )}
      {activeScreen !== "dash" && activeScreen !== "security" && activeScreen !== "chat" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <h2>{activeScreen.toUpperCase()} Screen</h2>
          <p>This module is coming soon in the React migration.</p>
        </div>
      )}
    </LearnerShell>
  );
}
