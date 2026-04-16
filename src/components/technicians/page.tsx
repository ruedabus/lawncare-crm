import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { CreateTechnicianForm } from "../../components/technicians/create-technician-form";
import { TechniciansList } from "../../components/technicians/technicians-list";

export default async function TechniciansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: technicians, error } = await supabase
    .from("technicians")
    .select("id, name, email, phone, color, is_active, created_at")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  const technicianList = (technicians ?? []).map((tech) => ({
    id: tech.id,
    name: tech.name,
    email: tech.email,
    phone: tech.phone,
    color: tech.color,
    is_active: tech.is_active,
    created_at: tech.created_at,
  }));

  return (
    <AppShell title="Technicians">
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <CreateTechnicianForm />
        </div>

        <div className="xl:col-span-2">
          <TechniciansList technicians={technicianList} error={error?.message ?? null} />
        </div>
      </div>
    </AppShell>
  );
}