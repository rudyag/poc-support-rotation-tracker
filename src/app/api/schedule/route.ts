import { normalizeWeekStart } from "@/lib/rotation";
import { groupScheduleByWeek, listScheduleRows } from "@/lib/schedule";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  const parsedStart = startParam ? normalizeWeekStart(startParam) : null;
  const parsedEnd = endParam ? normalizeWeekStart(endParam) : null;
  const start = parsedStart ?? undefined;
  const end = parsedEnd ?? undefined;

  if (startParam && !parsedStart) {
    return Response.json({ error: "start must be a valid ISO date (YYYY-MM-DD)" }, { status: 400 });
  }

  if (endParam && !parsedEnd) {
    return Response.json({ error: "end must be a valid ISO date (YYYY-MM-DD)" }, { status: 400 });
  }

  if (start && end && start > end) {
    return Response.json({ error: "start cannot be after end" }, { status: 400 });
  }

  const rows = await listScheduleRows(start, end);
  const weeks = groupScheduleByWeek(rows);

  return Response.json({
    count: rows.length,
    rows,
    weeks,
  });
}
