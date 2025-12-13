"use server";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { CourseCard } from "@/components/course-card";
import { Preview } from "@/components/preview";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface AdminIdPageProps {
  params: Promise<{
    adminId: string;
  }>;
}

const AdminIdPage = async ({ params }: AdminIdPageProps) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const { adminId } = await params;

  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      isPublished: true,
    },
    include: {
      school: true,
      courses: {
        where: {
          isPublished: true,
        },
        include: {
          tutors: {
            where: {
              isPublished: true,
            },
          },
        },
      },
    },
  });

  if (!admin) {
    return redirect("/");
  }

  return (
    <div className="p-8 max-w-screen-lg mx-auto space-y-12">
      {/* Admin Description Section */}
      <section className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{admin.title}</h1>
        <div className="prose prose-sm max-w-none text-gray-700">
          <Preview value={admin.description || "No description available."} />
        </div>
        <Link href={`/admin/admins/${adminId}/noticeboards`}>
          <Button variant="outline" className="mt-6 w-full sm:w-auto border-gray-300 hover:bg-gray-50">
            View Noticeboards
          </Button>
        </Link>
      </section>

      {/* Courses Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-gray-900">Courses by {admin.title}</h2>
        {admin.courses.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No courses available.</p>
            <p className="text-gray-400 text-sm mt-2">Check back later for new courses from {admin.title}.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {admin.courses.map((course) => (
              <CourseCard
                key={course.id}
                id={course.id}
                title={course.title}
                imageUrl={course.imageUrl ?? "/placeholder.jpg"}
                tutorialsLength={course.tutors.length}
                description={course.description ?? ""}
                progress={null} // TODO: Implement progress if needed
                admin={admin.title}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminIdPage;
