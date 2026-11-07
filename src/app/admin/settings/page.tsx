import { getSettings } from "@/lib/settings";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { TelegramConnect } from "@/components/admin/TelegramConnect";
import { MailConnect } from "@/components/admin/MailConnect";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  return (
    <div className="space-y-10">
      <MailConnect />
      <TelegramConnect />
      <SettingsForm initial={await getSettings()} />
    </div>
  );
}
