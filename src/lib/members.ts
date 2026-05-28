import { asc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { members } from "@/lib/schema";

export type ActiveMember = {
  id: number;
  name: string;
  email: string;
  createdAt: string;
};

export async function getActiveMembers(): Promise<ActiveMember[]> {
  return db
    .select({
      id: members.id,
      name: members.name,
      email: members.email,
      createdAt: members.createdAt,
    })
    .from(members)
    .where(eq(members.active, true))
    .orderBy(asc(members.name));
}