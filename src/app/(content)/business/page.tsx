import type { Metadata } from "next";
import { BusinessContact } from "./BusinessContact";

export const metadata: Metadata = { title: "For Business — SPORT LINER" };

export default function BusinessPage() {
  return <BusinessContact />;
}
