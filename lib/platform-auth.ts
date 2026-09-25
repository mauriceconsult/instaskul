// lib/platform-auth.ts
import { createClerkClient } from "@clerk/backend";

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY is not configured");
}
const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

export async function requirePlatformUser(req: Request): Promise<string | null> {
  const { isAuthenticated, toAuth } = await clerkClient.authenticateRequest(req, {
    acceptsToken: "oauth_token",
  });
  if (!isAuthenticated) return null;
  const { userId } = toAuth();
  return userId ?? null;
}