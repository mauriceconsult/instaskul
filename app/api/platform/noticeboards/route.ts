// app/api/platform/noticeboards/route.ts
import { verifyToken } from "@clerk/backend";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

type ClerkTokenClaims = { sub?: string };

const parseAllowedOrigins = () =>
  (process.env.ALLOWED_ORIGINS ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

export async function POST(req: Request) {
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    console.error("[PLATFORM_NOTICEBOARD_AUTH] CLERK_SECRET_KEY is not configured");
    return NextResponse.json({ error: "Server auth misconfigured" }, { status: 500 });
  }

  const allowedOrigins = parseAllowedOrigins();
  const verificationOptions: Parameters<typeof verifyToken>[1] = { secretKey };
  if (allowedOrigins.length > 0) {
    verificationOptions.authorizedParties = allowedOrigins;
  }

  const { data, errors } = await verifyToken(token, verificationOptions);
  const claims = data as ClerkTokenClaims | null;

  if (errors || !claims || typeof claims.sub !== "string" || !claims.sub.trim()) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const userId = claims.sub;
  const admin = await prisma.admin.findFirst({ where: { userId } });
  if (!admin) return NextResponse.json({ error: "No admin account for this user" }, { status: 404 });

  const { title } = await req.json();
  if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const lastNoticeboard = await prisma.noticeboard.findFirst({
    where: { adminId: admin.id },
    orderBy: { position: "desc" },
    select: { position: true },
  });

  const noticeboard = await prisma.noticeboard.create({
    data: { title: title.trim(), adminId: admin.id, userId, position: (lastNoticeboard?.position ?? 0) + 1 },
  });

  return NextResponse.json(noticeboard);
}