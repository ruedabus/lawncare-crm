import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { AppShell } from "../../components/layout/app-shell";
import { getUserPlanInfo } from "../../lib/plan-guard";
import { UpgradeWall } from "../../components/plan/upgrade-wall";
import { ExpensesClient } from "../../components/expenses/expenses-client";

export default async function ExpensesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { config, planName } = await getUserPlanInfo();

  if (!config.expenseLogging) {
    return (
      <AppShell title="Expenses">
        <UpgradeWall
          feature="Expense Tracking"
          description="Log and track your business expenses — fuel, equipment, parts, and more. See where your money goes and understand your real profit margins. Available on Pro and Premier plans."
          currentPlan={planName}
        />
      </AppShell>
    );
  }

  const { data: expenses } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false });

  return (
    <AppShell title="Expenses">
      <ExpensesClient
        initialExpenses={expenses ?? []}
        planName={planName}
        hasReports={config.expenseReports}
      />
    </AppShell>
  );
}
