import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  req: NextRequest,
  props: { params: Promise<{ adminId: string; courseId: string }> }
) {
  const params = await props.params;
  try {
    const { adminId, courseId } = params;
    const { amount } = await req.json();

    if (!adminId || !courseId) {
      return NextResponse.json({ message: 'Invalid adminId or courseId' }, { status: 400 });
    }

    const course = await prisma.course.findFirst({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    if (amount !== null && (typeof amount !== 'string' || isNaN(Number(amount)))) {
      return NextResponse.json(
        { message: 'Invalid amount: must be a string representing a number or null' },
        { status: 400 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { amount },
    });

    return NextResponse.json(updatedCourse);
  } catch (error) {
    console.error('Update course amount error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
