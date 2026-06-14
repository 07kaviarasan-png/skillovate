"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { LearnerLogin } from "@/components/learner/LearnerLogin";
import { LearnerShell } from "@/components/layout/LearnerShell";
import { LearnerDashboard } from "@/components/learner/LearnerDashboard";
import { LearnerMockInterview } from "@/components/learner/LearnerMockInterview";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Separate component so useSearchParams is inside a Suspense boundary
function LearnerContent() {
  const { isAuthenticated } = useAuthStore();
  const { activeScreen } = useUiStore();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!isAuthenticated) {
    return <LearnerLogin initialMode={mode} />;
  }

  return (
    <LearnerShell>
      {activeScreen === "dash" && <LearnerDashboard />}
      {activeScreen === "iv" && <LearnerMockInterview />}
      {activeScreen !== "dash" && activeScreen !== "iv" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <h2>{activeScreen.toUpperCase()} Screen</h2>
          <p>This module is coming soon in the React migration.</p>
        </div>
      )}
    </LearnerShell>
  );
}

export default function LearnerPage() {
  return (
    <Suspense fallback={null}>
      <LearnerContent />
    </Suspense>
  );
}
