// lib/is-admin.ts
// Simple admin check for protecting blog and other admin-only features

import { auth } from "@clerk/nextjs/server";

/**
 * Check if current user is an admin
 * Uses ADMIN_USER_IDS from environment variables
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return false;
    }
    
    const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
    return adminIds.includes(userId);
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Require admin access or throw error
 * Use in Server Components and API routes
 * 
 * Example:
 * ```typescript
 * export default async function BlogAdminPage() {
 *   await requireAdmin();
 *   // User is admin, render page
 * }
 * ```
 */
export async function requireAdmin(): Promise<void> {
  const admin = await isAdmin();
  
  if (!admin) {
    throw new Error("Admin access required");
  }
}

/**
 * Check if a specific user ID is an admin
 * @param userId - Clerk user ID to check
 */
export function checkIsAdmin(userId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
  return adminIds.includes(userId);
}

/**
 * Get list of admin user IDs
 */
export function getAdminIds(): string[] {
  return process.env.ADMIN_USER_IDS?.split(',').map(id => id.trim()) || [];
}
