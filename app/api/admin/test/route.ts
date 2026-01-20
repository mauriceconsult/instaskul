// app/api/admin/test/route.ts
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  
  const adminIds = process.env.ADMIN_USER_IDS?.split(',') || [];
  const isAdmin = adminIds.includes(userId);
  
  return NextResponse.json({
    userId,
    isAdmin,
    message: isAdmin ? 'You are an admin!' : 'You are not an admin'
  });
}