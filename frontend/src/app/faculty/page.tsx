"use client";

import React, { useEffect, useState } from "react";
import { FacultyLogin } from "@/components/auth/FacultyLogin";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { LearnerShell } from "@/components/layout/LearnerShell";
import { FacultyUpload } from "@/components/faculty/FacultyUpload";

export default function FacultyPage() {
  const { isAuthenticated, user } = useAuthStore();
  const { activeScreen, setActiveScreen } = useUiStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (activeScreen === "dash") {
      setActiveScreen("upload");
    }
  }, [activeScreen, setActiveScreen]);

  if (!mounted) return null;

  if (!isAuthenticated || user?.role !== "faculty") {
    return <FacultyLogin />;
  }

  return (
    <LearnerShell>
      {activeScreen === "upload" && <FacultyUpload />}
      {activeScreen === "dash" && (
        <div style={{ padding: "40px" }}>
          <h2>Welcome, {user?.name}</h2>
          <p>Role: {user?.role}</p>
          <p>Faculty Dashboard is under migration.</p>
        </div>
      )}
      {activeScreen !== "dash" && activeScreen !== "upload" && (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--muted)" }}>
          <h2>{activeScreen.toUpperCase()} Screen</h2>
          <p>This module is coming soon in the React migration.</p>
        </div>
      )}
    </LearnerShell>
  );
}
