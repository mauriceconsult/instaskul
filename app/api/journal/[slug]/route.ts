// app/api/journal/[slug]/route.ts
// Public endpoint — no auth required.
// Returns the article metadata + backlinks to its course and related courses.

import { NextRequest, NextResponse } from "next/server";
import { prisma }                    from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const article = await prisma.journalArticle.findUnique({
    where:   { slug, isPublic: true, status: "approved" },
    include: {
      journal: {
        include: {
          course: {
            select: {
              id:          true,
              title:       true,
              description: true,
              imageUrl:    true,
              amount:      true,
              currency:    true,
            },
          },
        },
      },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Find other published articles for the "Related Courses" backlink section
  const related = await prisma.journalArticle.findMany({
    where: {
      isPublic: true,
      status:   "approved",
      slug:     { not: slug },
    },
    include: {
      journal: {
        select: {
          title:  true,
          course: { select: { id: true, title: true, imageUrl: true, amount: true } },
        },
      },
    },
    orderBy: { publishedAt: "desc" },
    take:    6,
  });

  return NextResponse.json({
    article: {
      title:       article.journal.title,
      excerpt:     article.excerpt,
      articleUrl:  article.articleUrl,
      wordCount:   article.wordCount,
      publishedAt: article.publishedAt,
      style:       article.journal.style,
    },
    course: {
      ...article.journal.course,
      enrollUrl: `https://www.instaskul.com/courses/${article.journal.course?.id}`,
    },
    relatedCourses: related.map((r) => ({
      courseId:  r.journal.course?.id,
      title:     r.journal.course?.title,
      imageUrl:  r.journal.course?.imageUrl,
      amount:    r.journal.course?.amount,
      slug:      r.slug,
      articleUrl: r.articleUrl,
    })),
  });
}