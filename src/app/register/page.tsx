import type { Metadata } from "next";
import { RegisterForm } from "./RegisterForm";

export const metadata: Metadata = { title: "Регистрация — SPORT LINER" };

export default function RegisterPage() {
  return (
    <main className="flex flex-1 flex-col">
      <RegisterForm />
    </main>
  );
}
