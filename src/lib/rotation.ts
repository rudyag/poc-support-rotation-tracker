export type RotationAssignment = {
  memberId: number;
  weekStart: string;
};

function toUtcDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toUtcDateOnly(dateString: string): Date {
  return new Date(`${dateString}T00:00:00Z`);
}

export function startOfIsoWeek(inputDate: Date): string {
  const date = new Date(
    Date.UTC(inputDate.getUTCFullYear(), inputDate.getUTCMonth(), inputDate.getUTCDate()),
  );
  const dayOffset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayOffset);
  return toUtcDateString(date);
}

export function addWeeks(weekStart: string, weeksToAdd: number): string {
  const date = toUtcDateOnly(weekStart);
  date.setUTCDate(date.getUTCDate() + weeksToAdd * 7);
  return toUtcDateString(date);
}

export function normalizeWeekStart(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  const parsed = toUtcDateOnly(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return startOfIsoWeek(parsed);
}

export function generateRotation(memberIds: number[], startWeek: string, weeks: number): RotationAssignment[] {
  if (memberIds.length < 2) {
    throw new Error("at least 2 members are required");
  }

  if (!Number.isInteger(weeks) || weeks <= 0) {
    throw new Error("weeks must be a positive integer");
  }

  const assignments: RotationAssignment[] = [];

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const weekStart = addWeeks(startWeek, weekIndex);
    const starterIndex = weekIndex % memberIds.length;
    const overlapIndex = (starterIndex - 1 + memberIds.length) % memberIds.length;

    assignments.push({ memberId: memberIds[overlapIndex], weekStart });
    assignments.push({ memberId: memberIds[starterIndex], weekStart });
  }

  return assignments;
}
