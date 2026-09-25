import { requirePlatformUser } from "@/lib/platform-auth";
import { getAdminForUser } from "@/lib/platform-ownership";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const userId = await requirePlatformUser(req);
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const admin = await getAdminForUser(userId);
  if (!admin) return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });

  const noticeboards = await prisma.noticeboard.findMany({
    where: { adminId: admin.id },
    orderBy: { position: "asc" },
  });
  return NextResponse.json(noticeboards);
}

export async function POST(req: Request) {
  const userId = await requirePlatformUser(req);
  if (!userId) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const admin = await getAdminForUser(userId);
  if (!admin) return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const title =
    typeof body === "object" && body !== null && "title" in body && typeof body.title === "string"
      ? body.title.trim()
      : "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const lastNoticeboard = await prisma.noticeboard.findFirst({
    where: { adminId: admin.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const noticeboard = await prisma.noticeboard.create({
    data: {
      title,
      adminId: admin.id,
      userId,
      position: (lastNoticeboard?.position ?? 0) + 1,
    },
  });

  return NextResponse.json(noticeboard);
}