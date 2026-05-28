import { getCurrentSupportSnapshot } from "@/lib/schedule";

export async function GET() {
  const snapshot = await getCurrentSupportSnapshot();
  return Response.json(snapshot);
}
