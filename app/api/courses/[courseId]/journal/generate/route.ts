import { auth }                          from "@clerk/nextjs/server";
import { NextRequest, NextResponse }     from "next/server";
import { prisma }                        from "@/lib/prisma";
import { generateJournalArticle }        from "@/lib/journal/article-generator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> },
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { courseId } = await params;

  // ── Verify caller is this course's admin/creator ─────────────────────────
  const course = await prisma.course.findUnique({
    where:  { id: courseId },
    select: { adminId: true },
  });
  if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 });

  const admin = await prisma.admin.findFirst({
    where: { id: course.adminId ?? "", userId },
  });
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // ── Journal must exist (created by the admin in the course settings) ──────
  const journal = await prisma.journal.findUnique({ where: { courseId } });
  if (!journal) {
    return NextResponse.json(
      { error: "No journal configured for this course — create one in course settings first" },
      { status: 404 },
    );
  }

  try {
    const submission = await generateJournalArticle({
      input: {
        journalId: journal.id,
        style:     journal.style as "APA" | "MLA" | "Chicago",
        minWords:  journal.minWords,
        maxWords:  journal.maxWords,
      },
      generatedBy: userId,
      journalId:   journal.id,
    });

    return NextResponse.json({
      submissionId: submission.id,
      articleUrl:   submission.articleUrl,
      wordCount:    submission.wordCount,
      status:       submission.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Article generation failed";
    console.error("[JOURNAL_GENERATE]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}