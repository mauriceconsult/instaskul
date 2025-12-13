export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { headers } from "next/headers";
import { Clock, CheckCircle } from "lucide-react";
import InfoCard from "./_components/info-card";
import { getDashboardData } from "@/actions/get-dashboard-data";

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
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Courses */}
          <InfoCard
            icon={Clock}
            label="Courses In Progress"
            numberOfItems={
              Array.isArray(coursesInProgress)
                ? coursesInProgress.length
                : typeof coursesInProgress === "number"
                ? coursesInProgress
                : 0
            }
            variant="default"
          />
          <InfoCard
            icon={CheckCircle}
            label="Completed Courses"
            numberOfItems={
              Array.isArray(completedCourses)
                ? completedCourses.length
                : typeof completedCourses === "number"
                ? completedCourses
                : 0
            }
            variant="success"
          />

          {/* Admins / School Setup */}
<InfoCard
  icon={Clock}
  label="Admin Setup In Progress"
  numberOfItems={adminsInProgress}
  variant="default"
  singular="admin"
  plural="admins"
/>
<InfoCard
  icon={CheckCircle}
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
        <p className="text-red-600">Error loading dashboard. Please refresh.</p>
      </div>
    );
  }
}