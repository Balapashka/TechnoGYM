import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InfoPage } from "@/components/InfoPage";
import { getInfoPage, infoSlugs } from "@/lib/pages";
import { getSettings } from "@/lib/settings";
import { yookassaEnabled } from "@/lib/payments/yookassa";
import { mergeSettings } from "@/lib/settings-shape";

export function generateStaticParams() {
  return infoSlugs.map((page) => ({ page }));
}

// Texts include contacts and legal details from /admin/settings, so render on
// request: a saved setting must show up immediately.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}): Promise<Metadata> {
  const { page } = await params;
  // Titles do not depend on settings; defaults avoid a DB read here.
  const content = getInfoPage(page, { settings: mergeSettings([]), onlinePayment: false });
  return content
    ? { title: `${content.title} — SPORT LINER`, description: content.lead }
    : { title: "Страница не найдена — SPORT LINER" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const settings = await getSettings();
  const content = getInfoPage(page, { settings, onlinePayment: yookassaEnabled() });
  if (!content) notFound();
  return <InfoPage content={content} settings={settings} />;
}
