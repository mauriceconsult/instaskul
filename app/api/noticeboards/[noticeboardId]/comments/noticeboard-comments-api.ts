// app/api/noticeboards/[noticeboardId]/comments/route.ts
import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { noticeboardId: string } }
) {
  try {
    const { noticeboardId } = params;

    const comments = await prisma.noticeboardComment.findMany({
      where: {
        noticeboardId,
        adminId: null, // Only top-level comments
      },
      include: {
        replies: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Fetch user names from Clerk
    const clerk = await clerkClient();
    const userIds = [
      ...comments.map((c) => c.userId),
      ...comments.flatMap((c) => c.replies.map((r) => r.userId)),
    ];

    const users = await Promise.all(
      [...new Set(userIds)].map((id) => clerk.users.getUser(id))
    );

    const userMap = Object.fromEntries(
      users.map((u) => [u.id, `${u.firstName} ${u.lastName}`.trim()])
    );

    const commentsWithNames = comments.map((comment) => ({
      ...comment,
      userName: userMap[comment.userId] || "Anonymous",
      replies: comment.replies.map((reply) => ({
        ...reply,
        userName: userMap[reply.userId] || "Anonymous",
      })),
    }));

    return NextResponse.json(commentsWithNames);
  } catch (error) {
    console.error("[NOTICEBOARD_COMMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { noticeboardId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { noticeboardId } = params;
    const { content, parentId } = await req.json();

    if (!content || !content.trim()) {
      return new NextResponse("Content is required", { status: 400 });
    }

    const comment = await prisma.noticeboardComment.create({
      data: {
        noticeboardId,
        userId,
        content: content.trim(),
        adminId: parentId || null,
      },
    });

    // Get user name
    const clerk = await clerkClient();
    const user = await clerk.users.getUser(userId);
    const userName = `${user.firstName} ${user.lastName}`.trim();

    return NextResponse.json({
      ...comment,
      userName,
      replies: [],
    });
  } catch (error) {
    console.error("[NOTICEBOARD_COMMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
