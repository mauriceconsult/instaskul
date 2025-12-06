export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        admins: {
          select: {
            id: true,
            title: true,
            description: true,
            imageUrl: true,
            isPublished: true,
          },
          orderBy: {
            title: "asc",
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(
      `[${new Date().toISOString()} GET /api/schools] Schools fetched:`,
      schools
    );

    return NextResponse.json({
      success: true,
      data: schools,
    });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()} GET /api/schools] Error:`,
      error
    );
    return NextResponse.json(
      { success: false, message: "Failed to fetch schools" },
      { status: 500 }
    );
  }
}
