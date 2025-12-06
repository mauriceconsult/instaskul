export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { headers } from "next/headers";
import { Clock, CheckCircle } from "lucide-react";
import InfoCard from "./_components/info-card";
import { getDashboardData } from "@/actions/get-dashboard-data";

export default async function Dashboard() {
  await headers();

  try {
    console.log("Fetching dashboard data...");
    const { adminsInProgress, adminsCompleted, coursesInProgress, completedCourses } = await getDashboardData();
    console.log("Dashboard data:", { coursesInProgress, completedCourses });

    return (
      <div>
        <InfoCard
          icon={Clock}
          label="In progress"
          numberOfItems={adminsInProgress ? (coursesInProgress ? coursesInProgress.length : 0) : 0}
        />
        <InfoCard
          icon={CheckCircle}
          label="Completed"
          numberOfItems={adminsCompleted ? (completedCourses ? completedCourses.length : 0) : 0}
        />
      </div>
    );
  } catch (error) {
    console.error("Dashboard page error:", error);
    return (
      <div>
        <p>Error loading dashboard. Please try again.</p>
      </div>
    );
  }
}
