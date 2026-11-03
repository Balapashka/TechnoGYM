import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Вход — SPORT LINER" };
export const dynamic = "force-dynamic";

export default function LoginPage() {
  // Test credentials are listed only in demo mode (see .env.example).
  const showDemoAccounts = process.env.DEMO_ACCOUNTS === "true";
  return (
    <main className="flex flex-1 flex-col">
      <Suspense>
        <LoginForm showDemoAccounts={showDemoAccounts} />
      </Suspense>
    </main>
  );
}
