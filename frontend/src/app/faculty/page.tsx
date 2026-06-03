"use client";

import React from "react";
import { FacultyLogin } from "@/components/auth/FacultyLogin";
import { useAuthStore } from "@/stores/authStore";

export default function FacultyPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== "faculty") {
    return <FacultyLogin />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Faculty Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      {/* TODO: Add faculty shell */}
    </div>
  );
}
