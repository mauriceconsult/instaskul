// middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Public routes that don't require authentication
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
  // Beta public routes (validation and redemption)
  "/api/beta/validate",
  "/api/beta/redeem",
  "/beta/join", // Public beta signup page
]);

// Routes that require beta access validation
const isBetaRoute = createRouteMatcher([
  "/api/beta(.*)",
  "/beta(.*)",
]);

// Admin-only routes
const isAdminRoute = createRouteMatcher([
  "/admin(.*)",
  "/api/admin(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  // 1. Protect non-public routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 2. Handle admin routes
  if (isAdminRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    const isAdmin = await checkAdminAccess(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }
  }

  // 3. Handle beta routes (except public validation/redemption)
  if (isBetaRoute(req) && !isPublicRoute(req)) {
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    const betaAccess = await checkBetaAccess(userId);
    
    if (!betaAccess.hasAccess) {
      // User is authenticated but doesn't have beta access
      return NextResponse.json(
        { 
          error: 'Beta access required',
          reason: betaAccess.reason,
          requiresInvitation: true
        },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
});

/**
 * Check if user has valid beta access
 */
async function checkBetaAccess(userId: string): Promise<{
  hasAccess: boolean;
  reason?: string;
  user?: any;
}> {
  const prisma = new PrismaClient();

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { market: true }
    });

    if (!user) {
      return { 
        hasAccess: false, 
        reason: 'No beta access - invitation required' 
      };
    }

    if (!user.isActive) {
      return { 
        hasAccess: false, 
        reason: 'Account is inactive' 
      };
    }

    // Check market status
    const marketStatus = user.market.status;
    
    if (marketStatus === 'PLANNED') {
      return { 
        hasAccess: false, 
        reason: `${user.market.countryName} market is not yet available` 
      };
    }

    if (marketStatus === 'SUNSET') {
      return { 
        hasAccess: false, 
        reason: `${user.market.countryName} market is no longer supported` 
      };
    }

    // User has valid beta/GA access
    return { hasAccess: true, user };
  } catch (error) {
    console.error('Error checking beta access:', error);
    return { 
      hasAccess: false, 
      reason: 'Error validating access' 
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check if user has admin access
 * TODO: Implement your admin logic
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  // Option 1: Check against environment variable list
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  if (adminIds.includes(userId)) {
    return true;
  }

  // Option 2: Check Clerk metadata
  // const { clerkClient } = await import('@clerk/nextjs/server');
  // const user = await clerkClient.users.getUser(userId);
  // return user.publicMetadata?.role === 'admin';

  // Option 3: Check database
  // const prisma = new PrismaClient();
  // const user = await prisma.user.findUnique({
  //   where: { id: userId }
  // });
  // return user?.metadata?.isAdmin === true;

  return false;
}

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};