import { ThemedLanding } from "@/components/content/ThemedLanding";
import { landings } from "@/lib/landings";

export const metadata = { title: "Wellness — SPORT LINER" };
export default function Page() {
  return <ThemedLanding content={landings.wellness} />;
}
