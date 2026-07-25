import type { Metadata } from "next";
import { BusinessContact } from "./BusinessContact";

export const metadata: Metadata = { title: "Для бизнеса — SPORT LINER" };

export default function BusinessPage() {
  return <BusinessContact />;
}
