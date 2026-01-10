import Link from "next/link";
import { getDashboardData } from "@/actions/get-dashboard-data";
import InfoCard from "@/app/(admin)/admins/[adminId]/_components/info-card";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Dashboard() {
  const { userId } = await auth();
  if (!userId) {
    // Handle unauthenticated - redirect or show message
    return redirect("/sign-in")    
  }

  const data = await getDashboardData(userId).catch(() => ({
    adminsInProgress: 0,
    liveAdmins: 0,
    coursesInProgress: 0,
    completedCourses: 0,
  }));

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link
          href="/dashboard/admins"
          className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition-colors"
        >
          Admin Panel
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoCard
          iconName="Clock"
          label="Admins In Progress"
          numberOfItems={data.adminsInProgress}
          variant="default"
          singular="admin"
          plural="admins"
        />
        <InfoCard
          iconName="CheckCircle"
          label="Live Admins"
          numberOfItems={data.liveAdmins}
          variant="success"
          singular="admin"
          plural="admins"
        />
        <InfoCard
          iconName="Clock"
          label="Courses In Progress"
          numberOfItems={data.coursesInProgress}
          variant="default"
          singular="course"
          plural="courses"
        />
        <InfoCard
          iconName="CheckCircle"
          label="Live Courses"
          numberOfItems={data.completedCourses}
          variant="success"
          singular="course"
          plural="courses"
        />
      </div>
    </div>
  );
}