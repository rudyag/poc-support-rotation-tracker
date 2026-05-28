import "@/lib/db";

import { startOfIsoWeek } from "@/lib/rotation";
import { getCurrentSupportSnapshot } from "@/lib/schedule";

import { DashboardManager } from "./dashboard-manager";

export default async function Home() {
  const initialSnapshot = await getCurrentSupportSnapshot();
  const defaultStartWeek = startOfIsoWeek(new Date());

  return (
    <DashboardManager initialSnapshot={initialSnapshot} defaultStartWeek={defaultStartWeek} />
  );
}
