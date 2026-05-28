"use client";

import { FormEvent, useState } from "react";

type SupportMember = {
  id: number;
  name: string;
  email: string;
};

type SupportSnapshot = {
  currentWeekStart: string;
  currentMembers: SupportMember[];
  nextWeekStart: string;
  nextUp: SupportMember | null;
};

type DashboardManagerProps = {
  initialSnapshot: SupportSnapshot;
  defaultStartWeek: string;
};

async function fetchCurrentSnapshot(): Promise<SupportSnapshot> {
  const response = await fetch("/api/schedule/current", { cache: "no-store" });

  if (!response.ok) {
    throw new Error("Unable to load current schedule.");
  }

  return (await response.json()) as SupportSnapshot;
}

export function DashboardManager({ initialSnapshot, defaultStartWeek }: DashboardManagerProps) {
  const [snapshot, setSnapshot] = useState<SupportSnapshot>(initialSnapshot);
  const [startWeek, setStartWeek] = useState(defaultStartWeek);
  const [weeks, setWeeks] = useState("12");
  const [submitting, setSubmitting] = useState(false);
  const [loadingSnapshot, setLoadingSnapshot] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshSnapshot() {
    setLoadingSnapshot(true);
    setError(null);

    try {
      const latest = await fetchCurrentSnapshot();
      setSnapshot(latest);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load current schedule.");
    } finally {
      setLoadingSnapshot(false);
    }
  }

  async function handleGenerate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/schedule/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startWeek,
        weeks: Number.parseInt(weeks, 10),
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          error?: string;
          generatedWeeks?: number;
        }
      | null;

    if (!response.ok) {
      setError(payload?.error ?? "Unable to generate rotation.");
      setSubmitting(false);
      return;
    }

    setMessage(`Generated ${payload?.generatedWeeks ?? 0} week(s) of support coverage.`);
    setSubmitting(false);
    await refreshSnapshot();
  }

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Support Rotation Tracker</h1>
          <p className="mt-2 text-slate-600">Generate a staggered 2-week support rotation and monitor who is on now.</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Generate rotation</h2>
          <form className="mt-4 grid gap-4 sm:grid-cols-4" onSubmit={handleGenerate}>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Start week
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                type="date"
                value={startWeek}
                onChange={(event) => setStartWeek(event.target.value)}
                required
              />
            </label>
            <label className="flex flex-col gap-1 text-sm text-slate-700">
              Weeks
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
                type="number"
                min={1}
                max={260}
                value={weeks}
                onChange={(event) => setWeeks(event.target.value)}
                required
              />
            </label>
            <div className="sm:col-span-2 sm:self-end">
              <button
                className="inline-flex w-full items-center justify-center rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitting || loadingSnapshot}
                type="submit"
              >
                {submitting ? "Generating..." : "Generate rotation"}
              </button>
            </div>
          </form>
          {message ? <p className="mt-3 text-sm text-emerald-700">{message}</p> : null}
          {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">On support this week</h2>
            <p className="mt-1 text-sm text-slate-600">Week of {snapshot.currentWeekStart}</p>
            {loadingSnapshot ? <p className="mt-4 text-slate-600">Refreshing schedule...</p> : null}
            {!loadingSnapshot && snapshot.currentMembers.length === 0 ? (
              <p className="mt-4 text-slate-600">No rotation is scheduled for this week.</p>
            ) : null}
            {!loadingSnapshot && snapshot.currentMembers.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {snapshot.currentMembers.map((member) => (
                  <li className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2" key={member.id}>
                    <p className="font-medium text-slate-900">{member.name}</p>
                    <p className="text-sm text-slate-600">{member.email}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Next up</h2>
            <p className="mt-1 text-sm text-slate-600">Starter for week of {snapshot.nextWeekStart}</p>
            {snapshot.nextUp ? (
              <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
                <p className="font-medium text-slate-900">{snapshot.nextUp.name}</p>
                <p className="text-sm text-slate-600">{snapshot.nextUp.email}</p>
              </div>
            ) : (
              <p className="mt-4 text-slate-600">No upcoming assignment found.</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
