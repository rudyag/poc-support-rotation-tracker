import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { members } from "@/lib/schema";

type Params = Promise<{ id: string }>;

export async function DELETE(_request: Request, context: { params: Params }) {
  const { id: idParam } = await context.params;
  const id = Number.parseInt(idParam, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return Response.json({ error: "invalid member id" }, { status: 400 });
  }

  const removed = await db
    .update(members)
    .set({ active: false })
    .where(and(eq(members.id, id), eq(members.active, true)))
    .returning({ id: members.id });

  if (removed.length === 0) {
    return Response.json({ error: "member not found" }, { status: 404 });
  }

  return Response.json({ ok: true });
}