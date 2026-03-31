/**
 * POST /api/launcher/studio
 * Mints a cross-app session token via manager and returns
 * a redirect URL for studio with the token embedded.
 *
 * Body: { courseId? }
 * Returns: { url }
 */

import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";

const PLATFORM_API_URL = process.env.PLATFORM_API_URL ?? "http://localhost:4000";
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY ?? "";
const STUDIO_URL       = process.env.STUDIO_URL ?? "http://localhost:3001";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { courseId } = await req.json().catch(() => ({}));

    // Get the Clerk user to find their platform email
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const email = clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId
    )?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "No primary email" }, { status: 400 });
    }

    // Look up platform user by email
    const platformRes = await fetch(`${PLATFORM_API_URL}/api/users/upsert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLATFORM_API_KEY,
      },
      body: JSON.stringify({
        email,
        name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || email,
        phone: clerkUser.phoneNumbers?.[0]?.phoneNumber,
        avatarUrl: clerkUser.imageUrl,
      }),
    });

    if (!platformRes.ok) {
      throw new Error("Failed to resolve platform user");
    }

    const platformUser = await platformRes.json();

    // Mint cross-app token via manager
    const tokenRes = await fetch(`${PLATFORM_API_URL}/api/sessions/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLATFORM_API_KEY,
      },
      body: JSON.stringify({
        userId:    platformUser.id,
        originApp: "instaskul",
        targetApp: "studio",
      }),
    });

    if (!tokenRes.ok) {
      const { error } = await tokenRes.json();
      throw new Error(error ?? "Failed to mint session token");
    }

    const { token } = await tokenRes.json();

    // Build redirect URL — pass courseId as context if provided
    const params = new URLSearchParams({ token });
    if (courseId) params.set("courseId", courseId);

    const url = `${STUDIO_URL}/auth/cross?${params.toString()}`;

    return NextResponse.json({ url });
  } catch (err) {
    console.error("[api/launcher/studio]", err);
    return NextResponse.json(
      { error: "Failed to launch Studio" },
      { status: 500 }
    );
  }
}
