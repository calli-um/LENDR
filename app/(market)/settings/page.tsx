import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/actions/auth";
import { SettingsForm } from "@/components/profile/settings-form";

export default async function SettingsPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login?redirect=/settings");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-600">Manage your public profile.</p>
      </div>
      <SettingsForm profile={profile} />
    </div>
  );
}
