import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Beta code is required" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const betaInvite = await tx.betaInvite.findUnique({
        where: { code: code.toUpperCase() },
      });

      if (!betaInvite) {
        throw new Error("Invalid beta code");
      }

      if (betaInvite.isUsed) {
        throw new Error("This beta code has already been used");
      }

      if (betaInvite.expiresAt && new Date() > betaInvite.expiresAt) {
        throw new Error("This beta code has expired");
      }

      return await tx.betaInvite.update({
        where: { id: betaInvite.id },
        data: {
          isUsed: true,
          usedBy: userId,
          usedAt: new Date(),
        },
      });
    });

    return NextResponse.json({
      success: true,
      type: result.type,
      message: "Beta access granted!",
    });
  } catch (error: any) {
    console.error("[BETA_CLAIM]", error);
    return NextResponse.json(
      { error: error.message || "Internal error" },
      { status: 500 }
    );
  }
}
