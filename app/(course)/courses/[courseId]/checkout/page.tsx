import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmount } from "@/lib/format";
import { ArrowLeft, Smartphone, CreditCard } from "lucide-react";
import Link from "next/link";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const { courseId } = await params;

  // Check if already enrolled and paid
  const existingTuition = await prisma.tuition.findUnique({
    where: {
      userId_courseId: { userId, courseId },
    },
    select: { isPaid: true },
  });

  if (existingTuition?.isPaid) {
    redirect(`/courses/${courseId}`);
  }

  // Fetch course data
  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      amount: true,
      admin: {
        select: { title: true },
      },
    },
  });

  if (!course) {
    redirect("/dashboard/search");
  }

  // Safely convert amount (DB likely stores as string)
  const courseAmount = Number(course.amount) || 0;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href={`/courses/${courseId}`}
          className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to course
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header & Summary */}
          <div className="p-6 md:p-10 border-b">
            <h1 className="text-2xl md:text-3xl font-bold mb-3">
              Complete your enrollment
            </h1>
            <p className="text-slate-600 mb-8">
              Choose your preferred payment method to start learning
            </p>

            {/* Course info card */}
            <div className="bg-slate-50 rounded-xl p-6 border">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                  <h3 className="font-semibold text-xl">{course.title}</h3>
                  <p className="text-sm text-slate-600">
                    By {course.admin?.title || "Instructor"}
                  </p>
                </div>

                <div className="text-right whitespace-nowrap">
                  <span className="text-sm text-slate-600 block mb-1">Total Amount</span>
                  <span className="text-3xl md:text-4xl font-bold text-emerald-600">
                    {formatAmount(courseAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment methods */}
          <div className="p-6 md:p-10 space-y-6">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">
              Select Payment Method
            </h2>

            {/* MTN MoMo */}
            <Link
              href={`/courses/${courseId}/checkout/momo`}
              className="block border-2 rounded-xl p-6 hover:border-yellow-500 hover:bg-yellow-50/40 transition-all duration-200 group"
            >
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 bg-yellow-400 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                    <Smartphone className="h-8 w-8 text-slate-900" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg group-hover:text-yellow-700 transition-colors">
                      MTN Mobile Money
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Fast & secure payment with your MTN MoMo number
                    </p>
                  </div>
                </div>

                <div className="text-yellow-600 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  →
                </div>
              </div>
            </Link>

            {/* Airtel Money (placeholder) */}
            <div className="border-2 border-dashed rounded-xl p-6 bg-slate-50/50 opacity-70">
              <div className="flex items-center gap-5">
                <div className="h-16 w-16 bg-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-8 w-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-500 text-lg">Airtel Money</h3>
                  <p className="text-sm text-slate-500 mt-1">Coming soon</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="px-6 md:px-10 pb-8 md:pb-10 text-center">
            <p className="text-xs text-slate-500">
              By proceeding, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-slate-700 transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/refund-policy" className="underline hover:text-slate-700 transition-colors">
                Refund Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}