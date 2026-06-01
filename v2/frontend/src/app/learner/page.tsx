"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { LearnerLogin } from "@/components/learner/LearnerLogin";
import { LearnerShell } from "@/components/layout/LearnerShell";
import { LearnerDashboard } from "@/components/learner/LearnerDashboard";
import { useEffect, useState } from "react";

export default function LearnerPage() {
  const { isAuthenticated } = useAuthStore();
  const { activeScreen } = useUiStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return <LearnerLogin />;
  }

  return (
    <LearnerShell>
      {activeScreen === "dash" && <LearnerDashboard />}
      {activeScreen !== "dash" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <h2>{activeScreen.toUpperCase()} Screen</h2>
          <p>This module is coming soon in the React migration.</p>
        </div>
      )}
    </LearnerShell>
  );
}
