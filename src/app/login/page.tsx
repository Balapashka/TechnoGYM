import { LoginForm } from "./LoginForm";

export const metadata = { title: "Login — Movigym" };

export default function LoginPage() {
  return (
    <main className="flex flex-1 flex-col">
      <LoginForm />
    </main>
  );
}
