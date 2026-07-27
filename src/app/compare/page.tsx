import type { Metadata } from "next";
import { CompareView } from "./CompareView";

export const metadata: Metadata = {
  title: "Сравнение товаров — SPORT LINER",
  description: "Сравнение характеристик выбранных тренажёров.",
};

/** /compare — the list lives in localStorage, so the view is fully client-side. */
export default function ComparePage() {
  return <CompareView />;
}
