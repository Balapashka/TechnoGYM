import { ThemedLanding } from "@/components/content/ThemedLanding";
import { landings } from "@/lib/landings";

export const metadata = { title: "Велнес — SPORT LINER" };
export default function Page() {
  return <ThemedLanding content={landings.wellness} />;
}
