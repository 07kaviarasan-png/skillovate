"use client";

import { LearnerLogin } from "@/components/learner/LearnerLogin";
import { Suspense } from "react";

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <LearnerLogin initialMode="signup" />
    </Suspense>
  );
}
