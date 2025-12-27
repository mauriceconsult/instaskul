import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CourseCard } from "@/components/cards/course-card";
import { Preview } from "@/components/preview";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookOpen, Megaphone } from "lucide-react";

interface AdminIdPageProps {
  params: Promise<{ adminId: string }>;
}

const AdminIdPage = async ({ params }: AdminIdPageProps) => {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const { adminId } = await params;

  const admin = await prisma.admin.findUnique({
    where: {
      id: adminId,
      isPublished: true,
    },
    include: {
      school: true,
      courses: {
        where: { isPublished: true },
        include: {
          tutors: {
            where: { isPublished: true },
            select: { id: true }, // Only count needed
          },
        },
        orderBy: { createdAt: "desc" },
      },
      noticeboards: {
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!admin) {
    return redirect("/dashboard/admins");
  }

  const publishedCoursesCount = admin.courses.length;
  const publishedNoticeboardsCount = admin.noticeboards.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-blue-600 to-sky-600 h-48" />
          <div className="relative px-8 pb-12 -mt-24">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {admin.title}
              </h1>
              {admin.school && (
                <p className="text-lg text-gray-600 mb-4">
                  {admin.school.name}
                </p>
              )}
              <div className="prose prose-lg max-w-none text-gray-700">
                <Preview value={admin.description || "Welcome to our learning platform."} />
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-3 bg-blue-50 px-6 py-4 rounded-lg">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {publishedCoursesCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      Published Course{publishedCoursesCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-green-50 px-6 py-4 rounded-lg">
                  <Megaphone className="h-8 w-8 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {publishedNoticeboardsCount}
                    </p>
                    <p className="text-sm text-gray-600">
                      Noticeboard{publishedNoticeboardsCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Available Courses
            </h2>
            {publishedNoticeboardsCount > 0 && (
              <Link href={`/admins/${adminId}/noticeboards`}>
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  <Megaphone className="mr-2 h-5 w-5" />
                  View Noticeboards
                </Button>
              </Link>
            )}
          </div>

          {publishedCoursesCount === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                No courses yet
              </h3>
              <p className="text-lg text-gray-600 max-w-md mx-auto">
                {admin.title} hasn't published any courses yet. Check back soon for new learning opportunities!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {admin.courses.map((course) => (
                <CourseCard
                  key={course.id}
                  id={course.id}
                  title={course.title}
                  imageUrl={course.imageUrl || "/placeholder-course.jpg"}
                  description={course.description || ""}
                  admin={admin.title}
                  tutorialsLength={course.tutors.length}
                  progress={null} // Public view — no user progress
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminIdPage;