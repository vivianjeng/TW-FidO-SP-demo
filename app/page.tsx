import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { DashboardView } from "@/components/DashboardView";

export default async function DashboardPage() {
  const config = await getSessionConfig();
  const hosts = resolveHosts(config);
  const configured = isConfigComplete(config);

  return <DashboardView environment={config.environment} hosts={hosts} configured={configured} />;
}
