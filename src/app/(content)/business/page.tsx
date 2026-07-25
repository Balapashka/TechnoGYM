import type { Metadata } from "next";
import { BusinessContact } from "./BusinessContact";

export const metadata: Metadata = { title: "For Business — Movigym" };

export default function BusinessPage() {
  return <BusinessContact />;
}
