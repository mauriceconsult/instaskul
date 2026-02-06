import { prisma } from "@/lib/db";
import { Attachment, Noticeboard, Admin } from "@prisma/client";

interface GetNoticeboardProps {
  userId: string;
  adminId: string;
  noticeboardId: string;
}

export const getNoticeboard = async ({
  userId,
  adminId,
  noticeboardId,
}: GetNoticeboardProps): Promise<{
  noticeboard: Noticeboard | null;
  admin: Admin | null;
  attachments: Attachment[];
  nextNoticeboard: Noticeboard | null;
}> => {
  try {
    const admin = await prisma.admin.findFirst({
      where: {
        id: adminId,
        isPublished: true,
      },
    });

    if (!admin) {
      return {
        noticeboard: null,
        admin: null,
        attachments: [],
        nextNoticeboard: null,
      };
    }

    const noticeboard = await prisma.noticeboard.findFirst({
      where: {
        id: noticeboardId,
        adminId,
        isPublished: true,
      },
    });

    if (!noticeboard) {
      return {
        noticeboard: null,
        admin,
        attachments: [],
        nextNoticeboard: null,
      };
    }

    const attachments = await prisma.attachment.findMany({
      where: {
        noticeboardId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const nextNoticeboard = await prisma.noticeboard.findFirst({
      where: {
        adminId,
        isPublished: true,
        position: {
          gt: noticeboard.position ?? 0,
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    return {
      noticeboard,
      admin,
      attachments,
      nextNoticeboard,
    };
  } catch (error) {
    console.error("[GET_NOTICEBOARD_ERROR]", error);
    return {
      noticeboard: null,
      admin: null,
      attachments: [],
      nextNoticeboard: null,
    };
  }
};
