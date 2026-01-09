import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MomoPaymentForm } from "./_components/momo-payment-form";

const MomoCheckoutPage = async ({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const { courseId } = await params;

  // Check if already enrolled
  const existingTuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingTuition?.isPaid) {
    return redirect(`/courses/${courseId}`);
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      amount: true,
      admin: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!course) {
    return redirect("/dashboard/search");
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-md mx-auto px-4">
        <Link
          href={`/courses/${courseId}/checkout`}
          className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to payment options
        </Link>

        <MomoPaymentForm course={course} />
      </div>
    </div>
  );
};

export default MomoCheckoutPage;