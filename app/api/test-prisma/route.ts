import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const users = await (prisma as any).user.findMany({ take: 1 });
    return Response.json({ count: users.length });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}