import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/", 
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/docs",
  "/terms",
  "/api/public(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Public routes
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect everything else
  if (!userId) {
    return NextResponse.redirect(
      new URL("/sign-in", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static files
    "/((?!_next|.*\\..*).*)",
  ],
};
