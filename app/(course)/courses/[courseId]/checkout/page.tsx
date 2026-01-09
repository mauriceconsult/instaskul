import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmount } from "@/lib/format";
import { ArrowLeft, Smartphone, CreditCard } from "lucide-react";
import Link from "next/link";

const CheckoutPage = async ({
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
      description: true,
      imageUrl: true,
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
      <div className="max-w-2xl mx-auto px-4">
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to course
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <h1 className="text-2xl font-bold mb-2">Complete your enrollment</h1>
          <p className="text-slate-600 mb-6">
            Choose your preferred payment method
          </p>

          {/* Course Summary */}
          <div className="border rounded-lg p-4 mb-6 bg-slate-50">
            <h2 className="font-semibold mb-2">{course.title}</h2>
            <p className="text-sm text-slate-600 mb-2">
              By {course.admin?.title || "Unknown"}
            </p>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-medium">Total Amount</span>
              <span className="text-2xl font-bold text-emerald-600">
                {formatAmount(course.amount)}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm text-slate-700 mb-3">
              Select Payment Method
            </h3>

            {/* MTN Mobile Money */}
            <Link href={`/courses/${courseId}/checkout/momo`}>
              <div className="border-2 rounded-lg p-4 hover:border-yellow-500 hover:bg-yellow-50 transition cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-yellow-400 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-slate-900" />
                    </div>
                    <div>
                      <p className="font-semibold group-hover:text-yellow-700">
                        MTN Mobile Money
                      </p>
                      <p className="text-sm text-slate-600">
                        Pay with your MTN MoMo number
                      </p>
                    </div>
                  </div>
                  <div className="text-slate-400 group-hover:text-yellow-600 text-2xl">
                    →
                  </div>
                </div>
              </div>
            </Link>

            {/* Placeholder for future payment methods */}
            <div className="border-2 border-dashed rounded-lg p-4 opacity-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-slate-200 rounded-lg flex items-center justify-center">
                    <CreditCard className="h-6 w-6 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-400">
                      Airtel Money
                    </p>
                    <p className="text-sm text-slate-400">Coming soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-6 text-center">
            By proceeding, you agree to our terms of service and refund policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;