import { and, asc, eq, gte, inArray } from "drizzle-orm";

import { db } from "../src/lib/db";
import { generateRotation, startOfIsoWeek } from "../src/lib/rotation";
import { members, schedule } from "../src/lib/schema";

type DemoMember = {
  name: string;
  email: string;
};

const DEMO_MEMBERS: DemoMember[] = [
  { name: "Avery Johnson", email: "avery.johnson@agilitek.dev" },
  { name: "Jordan Lee", email: "jordan.lee@agilitek.dev" },
  { name: "Taylor Morgan", email: "taylor.morgan@agilitek.dev" },
  { name: "Riley Chen", email: "riley.chen@agilitek.dev" },
  { name: "Casey Brooks", email: "casey.brooks@agilitek.dev" },
  { name: "Logan Patel", email: "logan.patel@agilitek.dev" },
  { name: "Sydney Kim", email: "sydney.kim@agilitek.dev" },
  { name: "Parker Rivera", email: "parker.rivera@agilitek.dev" },
];

const DEFAULT_WEEKS = 16;

async function upsertDemoMembers() {
  for (const demoMember of DEMO_MEMBERS) {
    await db
      .insert(members)
      .values({
        name: demoMember.name,
        email: demoMember.email,
        active: true,
      })
      .onConflictDoUpdate({
        target: members.email,
        set: {
          name: demoMember.name,
          active: true,
        },
      });
  }

  const demoEmails = DEMO_MEMBERS.map((member) => member.email);

  return db
    .select({
      id: members.id,
      name: members.name,
      email: members.email,
    })
    .from(members)
    .where(and(eq(members.active, true), inArray(members.email, demoEmails)))
    .orderBy(asc(members.name));
}

async function main() {
  const startWeek = startOfIsoWeek(new Date());

  const demoMembers = await upsertDemoMembers();
  if (demoMembers.length < 2) {
    throw new Error("Seed aborted: fewer than 2 active demo members are available.");
  }

  const assignments = generateRotation(
    demoMembers.map((member) => member.id),
    startWeek,
    DEFAULT_WEEKS,
  );

  const deletedFuture = await db.delete(schedule).where(gte(schedule.weekStart, startWeek)).returning({ id: schedule.id });

  await db.insert(schedule).values(
    assignments.map((assignment) => ({
      memberId: assignment.memberId,
      weekStart: assignment.weekStart,
    })),
  );

  console.log("Demo seed complete.");
  console.log(`- Active demo members ensured: ${demoMembers.length}`);
  console.log(`- Future schedule rows replaced: ${deletedFuture.length}`);
  console.log(`- Weeks generated: ${DEFAULT_WEEKS}`);
  console.log(`- Assignments created: ${assignments.length}`);
  console.log(`- Start week: ${startWeek}`);
}

void main().catch((error) => {
  console.error("Seed failed.");
  console.error(error);
  process.exitCode = 1;
});
