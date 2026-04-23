import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { getTeamContext } from "../../lib/team";
import { AppShell } from "../../components/layout/app-shell";
import { SettingsTabs } from "../../components/settings/settings-tabs";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");
  const { ownerId, role } = await getTeamContext(supabase, user.id);

  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("user_id", ownerId)
    .maybeSingle();

  return (
    <AppShell title="Settings">
      <SettingsTabs
        user={{
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata?.full_name as string | undefined) ?? "",
        }}
        settings={settings}
        isOwner={role === null}
      />
    </AppShell>
  );
}
