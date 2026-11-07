import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetForm } from "./ResetForm";

export const metadata: Metadata = { title: "Новый пароль — SPORT LINER" };

export default function ResetPasswordPage() {
  return (
    <main className="flex flex-1 flex-col">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </main>
  );
}
