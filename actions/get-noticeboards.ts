// actions/get-noticeboards.ts
"use server";

import { prisma } from "@/lib/db";
import { Noticeboard, Admin, Attachment } from "@prisma/client";

export type NoticeboardWithRelations = Noticeboard & {
  admin: Admin | null;
  attachments: Attachment[];
};

export type GetNoticeboardsParams = {
  userId: string;     // kept for consistency, even if not used in query
  title?: string;
  adminId?: string;
};

export const getNoticeboards = async ({
  userId,
  title,
  adminId,
}: GetNoticeboardsParams): Promise<NoticeboardWithRelations[]> => {
  try {
    const noticeboards = await prisma.noticeboard.findMany({
      where: {
        isPublished: true,
        title: title
          ? { contains: title, mode: "insensitive" }
          : undefined,
        adminId,
      },
      include: {
        admin: true,
        attachments: {
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return noticeboards;
  } catch (error) {
    console.error("[GET_NOTICEBOARDS]", error);
    return [];
  }
};