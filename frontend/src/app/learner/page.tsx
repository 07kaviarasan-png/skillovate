"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { LearnerLogin } from "@/components/learner/LearnerLogin";
import { LearnerShell } from "@/components/layout/LearnerShell";
import { LearnerDashboard } from "@/components/learner/LearnerDashboard";
import { LearnerMockInterview } from "@/components/learner/LearnerMockInterview";
import { ResumeBuilder } from "@/components/learner/ResumeBuilder";
import { PlatformChat } from "@/components/shared/PlatformChat";
import { SettingsPanel } from "@/components/shared/SettingsPanel";
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

  const renderScreen = () => {
    switch (activeScreen) {
      case "dash": return <LearnerDashboard />;
      case "iv": return <LearnerMockInterview />;
      case "resume": return <ResumeBuilder />;
      case "chat": return <PlatformChat />;
      case "settings": return <SettingsPanel />;
      default:
        return (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
            <h2>{activeScreen.toUpperCase()} Screen</h2>
            <p>This module is coming soon.</p>
          </div>
        );
    }
  };

  return (
    <LearnerShell>
      {renderScreen()}
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

