import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, description, schoolName } = body;

    if (!title || !schoolName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user already has an admin account
    const existingAdmin = await prisma.admin.findFirst({
      where: { userId },
    });

    if (existingAdmin) {
      return new NextResponse("Admin account already exists", { status: 400 });
    }

    // Find or create school
    let school = await prisma.school.findUnique({
      where: { name: schoolName },
    });

    if (!school) {
      school = await prisma.school.create({
        data: { name: schoolName },
      });
    }

    // Create admin account
    const admin = await prisma.admin.create({
      data: {
        userId,
        title,
        description: description || null,
        schoolId: school.id,
        isPublished: false,
      },
    });

    return NextResponse.json(admin);
  } catch (error) {
    console.error("[ADMIN_CREATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
