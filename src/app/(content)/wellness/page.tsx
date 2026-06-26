import { ThemedLanding } from "@/components/content/ThemedLanding";
import { landings } from "@/lib/landings";

export const metadata = { title: "Wellness — Movigym" };
export default function Page() {
  return <ThemedLanding content={landings.wellness} />;
}
