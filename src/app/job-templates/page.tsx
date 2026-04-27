import { AppShell } from "../../components/layout/app-shell";
import { JobTemplatesClient } from "./job-templates-client";

export default function JobTemplatesPage() {
  return (
    <AppShell title="Job Templates">
      <JobTemplatesClient />
    </AppShell>
  );
}
