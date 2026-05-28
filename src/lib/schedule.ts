import { and, asc, eq, gte, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { addWeeks, startOfIsoWeek } from "@/lib/rotation";
import { members, schedule } from "@/lib/schema";

export type ScheduleMember = {
  id: number;
  name: string;
  email: string;
};

export type WeekSchedule = {
  weekStart: string;
  members: ScheduleMember[];
};

export type CurrentSupportSnapshot = {
  currentWeekStart: string;
  currentMembers: ScheduleMember[];
  nextWeekStart: string;
  nextUp: ScheduleMember | null;
};

type RawScheduleRow = {
  weekStart: string;
  memberId: number;
  memberName: string;
  memberEmail: string;
};

export async function listScheduleRows(start?: string, end?: string): Promise<RawScheduleRow[]> {
  const baseQuery = db
    .select({
      weekStart: schedule.weekStart,
      memberId: members.id,
      memberName: members.name,
      memberEmail: members.email,
    })
    .from(schedule)
    .innerJoin(members, eq(schedule.memberId, members.id));

  if (start && end) {
    return baseQuery
      .where(and(gte(schedule.weekStart, start), lte(schedule.weekStart, end)))
      .orderBy(asc(schedule.weekStart), asc(members.name));
  }

  if (start) {
    return baseQuery.where(gte(schedule.weekStart, start)).orderBy(asc(schedule.weekStart), asc(members.name));
  }

  if (end) {
    return baseQuery.where(lte(schedule.weekStart, end)).orderBy(asc(schedule.weekStart), asc(members.name));
  }

  return baseQuery.orderBy(asc(schedule.weekStart), asc(members.name));
}

export function groupScheduleByWeek(rows: RawScheduleRow[]): WeekSchedule[] {
  const grouped = new Map<string, ScheduleMember[]>();

  for (const row of rows) {
    const existing = grouped.get(row.weekStart) ?? [];
    existing.push({ id: row.memberId, name: row.memberName, email: row.memberEmail });
    grouped.set(row.weekStart, existing);
  }

  return Array.from(grouped.entries()).map(([weekStart, weekMembers]) => ({
    weekStart,
    members: weekMembers,
  }));
}

export async function getWeekMembers(weekStart: string): Promise<ScheduleMember[]> {
  const rows = await listScheduleRows(weekStart, weekStart);
  return rows.map((row) => ({ id: row.memberId, name: row.memberName, email: row.memberEmail }));
}

export async function getCurrentSupportSnapshot(referenceDate = new Date()): Promise<CurrentSupportSnapshot> {
  const currentWeekStart = startOfIsoWeek(referenceDate);
  const nextWeekStart = addWeeks(currentWeekStart, 1);

  const currentMembers = await getWeekMembers(currentWeekStart);
  const nextWeekMembers = await getWeekMembers(nextWeekStart);

  const currentMemberIds = new Set(currentMembers.map((member) => member.id));
  const nextUp = nextWeekMembers.find((member) => !currentMemberIds.has(member.id)) ?? nextWeekMembers[0] ?? null;

  return {
    currentWeekStart,
    currentMembers,
    nextWeekStart,
    nextUp,
  };
}
