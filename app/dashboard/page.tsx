import { headers } from "next/headers";
// import InfoCard from "./_components/info-card";
import { getDashboardData } from "@/actions/get-dashboard-data";
import InfoCard from "./_components/info-card";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  headers();

  try {
    const data = await getDashboardData();

    const {
      coursesInProgress = [],
      completedCourses = [],
      adminsInProgress = 0,
      completedAdmins = 0,
    } = data || {};

    return (
      <div className="p-6 space-y-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard
            iconName="Clock"
            label="Courses In Progress"
            numberOfItems={Array.isArray(coursesInProgress) ? coursesInProgress.length : 0}
            variant="default"
            singular="course"
            plural="courses"
          />
          <InfoCard
            iconName="CheckCircle"
            label="Completed Courses"
            numberOfItems={Array.isArray(completedCourses) ? completedCourses.length : 0}
            variant="success"
            singular="course"
            plural="courses"
          />
          <InfoCard
            iconName="Clock"
            label="Admin Setup In Progress"
            numberOfItems={adminsInProgress}
            variant="default"
            singular="admin"
            plural="admins"
          />
          <InfoCard
            iconName="CheckCircle"
            label="Admin Live"
            numberOfItems={completedAdmins}
            variant="success"
            singular="admin"
            plural="admins"
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error("Dashboard error:", error);
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-600 font-medium">Error loading dashboard</p>
          <p className="text-red-500 text-sm mt-1">Please refresh the page to try again.</p>
        </div>
      </div>
    );
  }
}