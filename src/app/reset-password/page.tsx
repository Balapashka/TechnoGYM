import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Set new password — Movigym" };

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetForm />
    </Suspense>
  );
}
