import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatAmount } from "@/lib/format";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { MPesaCheckout } from "@/components/admin/mpesa-checkout";

export default async function MPesaCheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { courseId } = await params;
  const course = await prisma.course.findUnique({
    where: { id: courseId, isPublished: true },
    select: {
      id: true,
      title: true,
      amount: true,
      currency: true,
    },
  });
  if (!course) redirect("/dashboard/search");
  if (course.currency !== "KES") {
    redirect(`/courses/${courseId}/checkout`);
  }

  const tuition = await prisma.tuition.findUnique({
    where: { userId_courseId: { userId, courseId } },
    select: { isPaid: true },
  });
  if (tuition?.isPaid) redirect(`/courses/${courseId}`);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-md space-y-6 px-4">
        <Link
          href={`/courses/${courseId}/checkout`}
          className="inline-flex items-center text-sm text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Back to payment options
        </Link>
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <h1 className="text-xl font-bold">Safaricom M-Pesa</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pay securely in Kenyan shillings using your M-Pesa number.
          </p>
          <div className="my-5 rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-600">Course</p>
            <p className="font-semibold">{course.title}</p>
            <p className="mt-3 text-lg font-bold text-emerald-700">
              {formatAmount(course.amount, course.currency)}
            </p>
          </div>
          <MPesaCheckout
            courseId={course.id}
            amount={course.amount}
            currency={course.currency}
            courseName={course.title}
          />
        </div>
      </div>
    </div>
  );
}
