// middleware.ts - Simplified (no Prisma)
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/dashboard",
  "/search",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/about",
  "/docs",
  "/terms",
  "/privacy",
  "/api/public(.*)",
  "/api/uploadthing(.*)",  
  "/api/webhook(.*)",
  "/api/beta/validate",
  "/api/beta/redeem",
  "/beta/join",
  "/blog(.*)",
]);

const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

const isBetaRoute = createRouteMatcher([
  "/api/beta(.*)",
  "/beta(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // Just check authentication, move DB checks to API routes
  if (!isPublicRoute(req) && !userId) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Admin and beta checks will be done in the actual API routes
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};