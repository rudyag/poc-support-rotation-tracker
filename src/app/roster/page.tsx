import { getActiveMembers } from "@/lib/members";

import { RosterManager } from "./roster-manager";

export default async function RosterPage() {
  const initialMembers = await getActiveMembers();

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <RosterManager initialMembers={initialMembers} />
    </main>
  );
}