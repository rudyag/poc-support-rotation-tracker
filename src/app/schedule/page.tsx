import { addWeeks, startOfIsoWeek } from "@/lib/rotation";
import { groupScheduleByWeek, listScheduleRows } from "@/lib/schedule";

function formatDate(weekStart: string): string {
  const date = new Date(`${weekStart}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export default async function SchedulePage() {
  const currentWeek = startOfIsoWeek(new Date());
  const start = addWeeks(currentWeek, -8);
  const end = addWeeks(currentWeek, 24);

  const rows = await listScheduleRows(start, end);
  const weeks = groupScheduleByWeek(rows);

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <section className="mx-auto w-full max-w-5xl px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Rotation schedule</h1>
          <p className="mt-2 text-slate-600">View upcoming support assignments and plan coverage in advance.</p>

          {weeks.length === 0 ? (
            <p className="mt-6 text-slate-600">
              No schedule data yet. Open Dashboard and generate a rotation to see upcoming coverage here.
            </p>
          ) : (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-600">
                    <th className="px-3 py-2 font-semibold">Week</th>
                    <th className="px-3 py-2 font-semibold">Support Member 1</th>
                    <th className="px-3 py-2 font-semibold">Support Member 2</th>
                  </tr>
                </thead>
                <tbody>
                  {weeks.map((week) => {
                    const isCurrent = week.weekStart === currentWeek;
                    const isPast = week.weekStart < currentWeek;
                    const rowClassName = isCurrent
                      ? "bg-sky-50"
                      : isPast
                        ? "opacity-55"
                        : "bg-white";

                    return (
                      <tr className={`border-b border-slate-100 ${rowClassName}`} key={week.weekStart}>
                        <td className="px-3 py-3 font-medium text-slate-900">
                          {formatDate(week.weekStart)}
                          {isCurrent ? (
                            <span className="ml-2 rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
                              Current
                            </span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3 text-slate-700">{week.members[0]?.name ?? "-"}</td>
                        <td className="px-3 py-3 text-slate-700">{week.members[1]?.name ?? "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
