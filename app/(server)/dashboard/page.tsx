import { headers } from "next/headers";
import Link from "next/link";
import InfoCard from "../_components/info-card";
import { getDashboardData } from "@/actions/get-dashboard-data";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  await headers();

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
        {/* Header with Admin Link */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          {/* Admin Link Button - Slate Gray */}
          <Link
            href="/admin/admins"
            className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition"
          >
            Admin Panel
          </Link>
        </div>

        {/* Dashboard Cards */}
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
