import { db } from "@/lib/db";
import { getActiveMembers } from "@/lib/members";
import { members } from "@/lib/schema";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  return Response.json(await getActiveMembers());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!name || !email) {
    return Response.json({ error: "name and email are required" }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "email is invalid" }, { status: 400 });
  }

  try {
    const created = await db
      .insert(members)
      .values({ name, email, active: true })
      .returning({
        id: members.id,
        name: members.name,
        email: members.email,
        createdAt: members.createdAt,
      });

    return Response.json(created[0], { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed: members.email")) {
      return Response.json({ error: "member email already exists" }, { status: 409 });
    }

    return Response.json({ error: "failed to create member" }, { status: 500 });
  }
}