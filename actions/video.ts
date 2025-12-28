"use server";

import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";

export async function uploadVideo({ tutorId }: { tutorId: string }) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  // Simulate upload to Mux
  const playbackId = `mux_${uuidv4()}`;

  // Upsert muxData for tutor
  await prisma.muxData.upsert({
    where: { tutorId },
    update: {
      playbackId,
    },
    create: {
      tutorId,
      assetId: `asset_${uuidv4()}`, // replace with real Mux assetId
      playbackId,
    },
  });

  return playbackId;
}
