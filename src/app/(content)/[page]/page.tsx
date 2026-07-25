import { notFound } from "next/navigation";
import { InfoPage } from "@/components/InfoPage";
import { getInfoPage, infoSlugs } from "@/lib/pages";

export function generateStaticParams() {
  return infoSlugs.map((page) => ({ page }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const content = getInfoPage(page);
  return { title: content ? `${content.title} — Movigym` : "Not found" };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const content = getInfoPage(page);
  if (!content) notFound();
  return <InfoPage content={content} />;
}
