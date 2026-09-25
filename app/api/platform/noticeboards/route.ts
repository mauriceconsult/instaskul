import { createClerkClient } from "@clerk/backend";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not configured");
}

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function POST(req: Request) {
  const { isAuthenticated, toAuth } = await clerkClient.authenticateRequest(req, {
    acceptsToken: "oauth_token", // confirm array vs string against installed types
  });
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const { userId } = toAuth(); // confirm this field name against installed types
  if (!userId) {
    return NextResponse.json({ error: "User ID missing from token" }, { status: 401 });
  }

  const admin = await prisma.admin.findFirst({ where: { userId } });
  if (!admin) {
    return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });
  }

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
  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

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