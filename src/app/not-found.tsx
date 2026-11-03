import type { Metadata } from "next";
import { ErrorScreen } from "@/components/layout/ErrorScreen";

export const metadata: Metadata = {
  title: "Страница не найдена — SPORT LINER",
  robots: { index: false },
};

export default function NotFound() {
  return <ErrorScreen kind="notFound" />;
}
