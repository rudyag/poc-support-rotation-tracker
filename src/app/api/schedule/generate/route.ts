import { asc, gte } from "drizzle-orm";

import { db } from "@/lib/db";
import { getActiveMembers } from "@/lib/members";
import { generateRotation, normalizeWeekStart, startOfIsoWeek } from "@/lib/rotation";
import { schedule } from "@/lib/schema";

type GenerateRequestBody = {
  startWeek?: unknown;
  weeks?: unknown;
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as GenerateRequestBody | null;

  const startWeek =
    normalizeWeekStart(body?.startWeek) ??
    (typeof body?.startWeek === "undefined" ? startOfIsoWeek(new Date()) : null);
  const weeks = typeof body?.weeks === "number" ? body.weeks : Number.parseInt(String(body?.weeks ?? ""), 10);

  if (!startWeek) {
    return Response.json({ error: "startWeek must be a valid ISO date (YYYY-MM-DD)" }, { status: 400 });
  }

  if (!Number.isInteger(weeks) || weeks <= 0 || weeks > 260) {
    return Response.json({ error: "weeks must be a positive integer between 1 and 260" }, { status: 400 });
  }

  const activeMembers = await getActiveMembers();
  if (activeMembers.length < 2) {
    return Response.json({ error: "at least 2 active members are required to generate a rotation" }, { status: 400 });
  }

  const memberIds = activeMembers.map((member) => member.id);
  const assignments = generateRotation(memberIds, startWeek, weeks);

  await db.delete(schedule).where(gte(schedule.weekStart, startWeek));
  await db.insert(schedule).values(
    assignments.map((assignment) => ({
      memberId: assignment.memberId,
      weekStart: assignment.weekStart,
    })),
  );

  const latestRows = await db
    .select({ weekStart: schedule.weekStart, memberId: schedule.memberId })
    .from(schedule)
    .where(gte(schedule.weekStart, startWeek))
    .orderBy(asc(schedule.weekStart));

  return Response.json({
    startWeek,
    weeks,
    entriesCreated: assignments.length,
    generatedWeeks: Array.from(new Set(latestRows.map((row) => row.weekStart))).length,
  });
}
