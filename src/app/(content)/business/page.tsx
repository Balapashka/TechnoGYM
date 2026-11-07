import type { Metadata } from "next";
import { BusinessContact } from "./BusinessContact";

export const metadata: Metadata = { title: "Для бизнеса — SPORT LINER" };

export default function BusinessPage() {
  return (
    <main className="flex flex-1 flex-col">
      <BusinessContact />
    </main>
  );
}
