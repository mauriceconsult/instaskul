import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string; assignmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { assignmentId } = await params;
    const body = await req.json();

    // Verify ownership
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId, userId },
    });

    if (!assignment) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Update assignment
    const updatedAssignment = await prisma.assignment.update({
      where: { id: assignmentId },
      data: body, 
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.log("[ASSIGNMENT_PATCH]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ adminId: string; courseId: string; tutorId: string; assignmentId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { assignmentId } = await params;
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId, userId },      
    });

    if (!assignment) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const deletedAssignment = await prisma.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json(deletedAssignment);
  } catch (error) {
    console.log("[ASSIGNMENT_DELETE]", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
