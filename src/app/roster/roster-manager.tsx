"use client";

import { FormEvent, useState } from "react";

type Member = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

type RosterManagerProps = {
  initialMembers: Member[];
};

export function RosterManager({ initialMembers }: RosterManagerProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMembers() {
    setLoading(true);
    setError(null);

    const response = await fetch("/api/members", { cache: "no-store" });
    if (!response.ok) {
      setError("Unable to load members right now.");
      setLoading(false);
      return;
    }

    const payload = (await response.json()) as Member[];
    setMembers(payload);
    setLoading(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    const response = await fetch("/api/members", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Unable to add member.");
      setSubmitting(false);
      return;
    }

    setName("");
    setEmail("");
    setSubmitting(false);
    await loadMembers();
  }

  async function handleRemove(id: number) {
    setError(null);

    const response = await fetch(`/api/members/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Unable to remove member.");
      return;
    }

    await loadMembers();
  }

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 p-6">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Add team member</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-3" onSubmit={handleSubmit}>
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            placeholder="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
          <input
            className="rounded-md border border-slate-300 px-3 py-2 text-slate-900 outline-none ring-sky-500 focus:ring-2"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <button
            className="rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={submitting}
            type="submit"
          >
            {submitting ? "Adding..." : "Add member"}
          </button>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Active members</h2>
        {error ? <p className="mt-3 text-sm text-rose-700">{error}</p> : null}
        {loading ? <p className="mt-4 text-slate-600">Loading members...</p> : null}
        {!loading && members.length === 0 ? (
          <p className="mt-4 text-slate-600">No active members yet.</p>
        ) : null}
        {!loading && members.length > 0 ? (
          <ul className="mt-4 divide-y divide-slate-200">
            {members.map((member) => (
              <li className="flex items-center justify-between py-3" key={member.id}>
                <div>
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-sm text-slate-600">{member.email}</p>
                </div>
                <button
                  className="rounded-md border border-rose-300 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-50"
                  onClick={() => void handleRemove(member.id)}
                  type="button"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}