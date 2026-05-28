import "@/lib/db";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <section className="max-w-xl rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Support Rotation Tracker</h1>
        <p className="mt-3 text-slate-600">Manage your support roster and upcoming shifts.</p>
        <Link
          className="mt-6 inline-flex rounded-md bg-sky-600 px-4 py-2 font-medium text-white hover:bg-sky-700"
          href="/roster"
        >
          Open roster
        </Link>
      </section>
    </main>
  );
}
