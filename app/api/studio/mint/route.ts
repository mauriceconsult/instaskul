/**
 * src/app/api/studio/mint/route.ts  (Zuria)
 *
 * Server-side proxy for minting a cross-app session token.
 * Keeps PLATFORM_API_KEY on the server — never exposed to the browser.
 *
 * Called by studio-ai.tsx (client component) as /api/studio/mint
 * Forwards to manager's /api/sessions/mint with the API key attached.
 */

import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const PLATFORM_API_URL = process.env.PLATFORM_API_URL ?? "http://localhost:4000";
const PLATFORM_API_KEY = process.env.PLATFORM_API_KEY ?? "";

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(`${PLATFORM_API_URL}/api/sessions/mint`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": PLATFORM_API_KEY,
      },
      body: JSON.stringify({
        userId,
        originApp: "zuria",
        targetApp: "studio",
      }),
    });

    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Mint failed" }));
      return NextResponse.json({ error }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/studio/mint]", err);
    return NextResponse.json({ error: "Failed to mint token" }, { status: 500 });
  }
}
