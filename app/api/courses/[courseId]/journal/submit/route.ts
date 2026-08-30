import { auth }                      from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";

// PATCH: admin submits the draft for platform review (draft → submitted)
// PUT:   platform admin approves/rejects (submitted → approved | rejected)

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where:  { id: courseId },
    select: { adminId: true },
  });
  const admin = course?.adminId
    ? await prisma.admin.findFirst({ where: { id: course.adminId, userId } })
    : null;
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const journal = await prisma.journal.findUnique({ where: { courseId } });
  if (!journal) return NextResponse.json({ error: "No journal" }, { status: 404 });

  const submission = await prisma.journalArticle.findFirst({
    where: { journalId: journal.id },
  });
  if (!submission?.articleUrl) {
    return NextResponse.json({ error: "Generate article first" }, { status: 400 });
  }
  if (submission.status !== "draft") {
    return NextResponse.json(
      { error: `Cannot submit — current status: ${submission.status}` },
      { status: 409 },
    );
  }

  const updated = await prisma.journalArticle.update({
    where: { id: submission.id },
    data:  { status: "submitted" },
  });

  return NextResponse.json({ status: updated.status });
}

// Platform admin approves or rejects
// app/api/courses/[courseId]/journal/submit/route.ts

// ... (PATCH unchanged — admin submits draft for review)

// PUT — platform admin approves/rejects
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const platformAdmins = (process.env.PLATFORM_ADMIN_CLERK_IDS ?? "").split(",");
  if (!platformAdmins.includes(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { courseId }            = await params;
  const { action, feedback }    = await req.json();

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const journal = await prisma.journal.findUnique({ where: { courseId } });
  if (!journal) return NextResponse.json({ error: "No journal" }, { status: 404 });

  const isApproved = action === "approve";

  const updated = await prisma.journalArticle.update({
    where: { journalId: journal.id },
    data:  {
      status:      isApproved ? "approved" : "rejected",
      isPublic:    isApproved,                        // goes live immediately on approval
      publishedAt: isApproved ? new Date() : null,    // sets the public timestamp
      feedback:    feedback ?? null,
    },
  });

  return NextResponse.json({
    status:      updated.status,
    isPublic:    updated.isPublic,
    publishedAt: updated.publishedAt,
    slug:        updated.slug,
    publicUrl:   updated.slug
      ? `https://www.instaskul.com/journal/${updated.slug}`
      : null,
  });
}