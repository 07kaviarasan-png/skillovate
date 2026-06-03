"use client";

import { LearnerLogin } from "@/components/learner/LearnerLogin";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LearnerLogin initialMode="login" />
    </Suspense>
  );
}
