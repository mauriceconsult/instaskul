// app/api/courseworks/[courseworkId]/submit/route.ts
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseworkId: string } }
) {
  const { userId } = await auth();
  
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { content } = await req.json();

  // Create submission (adjust based on your schema)
  const submission = await prisma.courseworkSubmission.create({
    data: {
      userId,
      courseworkId: params.courseworkId,   
    },
  });

  return NextResponse.json(submission);
}
