"use client";

import React from "react";
import { SuperAdminLogin } from "@/components/auth/SuperAdminLogin";
import { useAuthStore } from "@/stores/authStore";

export default function SuperAdminPage() {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || user?.role !== "super_admin") {
    return <SuperAdminLogin />;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Super Admin Dashboard</h1>
      <p>Welcome, {user.name}!</p>
      {/* TODO: Add pending users table */}
    </div>
  );
}
