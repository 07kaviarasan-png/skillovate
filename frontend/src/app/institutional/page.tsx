"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { CollegeAdminLogin } from "@/components/auth/CollegeAdminLogin";
import { LearnerShell } from "@/components/layout/LearnerShell"; // Will rename or generalize
import { useEffect, useState } from "react";

export default function InstitutionalPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { activeScreen } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated || user?.role !== "college_admin") {
    return <CollegeAdminLogin />;
  }

  // Temporary: use LearnerShell but with institutional context
  return (
    <LearnerShell>
      {activeScreen === "dash" && (
        <div style={{ padding: "40px" }}>
          <h2>Welcome, {user?.name}</h2>
          <p>Role: {user?.role}</p>
          <p>Institutional Dashboard is under migration.</p>
        </div>
      )}
      {activeScreen !== "dash" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <h2>{activeScreen.toUpperCase()} Screen</h2>
          <p>This module is coming soon in the React migration.</p>
        </div>
      )}
    </LearnerShell>
  );
}
