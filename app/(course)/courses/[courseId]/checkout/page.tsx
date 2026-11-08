import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmount } from "@/lib/format";
import { getCheckoutPaymentProviders } from "@/lib/payment/providers";
import { ArrowLeft, ArrowRight, Smartphone } from "lucide-react";
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
      amount: true,
      currency: true,
      admin: {
        select: { title: true },
      },
    },
  });

  if (!course) {
    redirect("/dashboard/search");
  }

  const providers = getCheckoutPaymentProviders(course.currency ?? "UGX");

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
                    {formatAmount(course.amount, course.currency ?? "UGX")}
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

            {providers.length > 0 ? providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/courses/${courseId}/checkout/${provider.checkoutPath}`}
                className="group flex items-center justify-between gap-4 rounded-xl border-2 p-5 transition-colors hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                    <Smartphone className="h-7 w-7 text-slate-700" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-900">
                      {provider.name}
                    </h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {provider.description}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {provider.country} · {provider.currency}
                    </p>
                  </div>
                </div>
                <ArrowRight
                  className="h-5 w-5 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-slate-700"
                  aria-hidden="true"
                />
              </Link>
            )) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
                No payment provider is currently available for courses priced in{" "}
                {course.currency ?? "this currency"}. Please contact support.
              </div>
            )}
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
