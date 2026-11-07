import type { Metadata } from "next";
import { ForgotForm } from "./ForgotForm";

export const metadata: Metadata = {
  title: "Восстановление пароля — SPORT LINER",
};

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 flex-col">
      <ForgotForm />
    </main>
  );
}
