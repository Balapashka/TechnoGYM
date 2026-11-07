import { ThemedLanding } from "@/components/content/ThemedLanding";
import { landings } from "@/lib/landings";

export const metadata = { title: "Велнес — SPORT LINER" };
export default function Page() {
  return (
    <main className="flex flex-1 flex-col">
      <ThemedLanding content={landings.wellness} />
    </main>
  );
}
