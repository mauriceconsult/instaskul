import Link from "next/link";
import { getDashboardData } from "@/actions/get-dashboard-data";
import InfoCard from "@/app/(admin)/admins/[adminId]/_components/info-card";

export const dynamic = "force-dynamic";
export const revalidate = 0; 

export default async function Dashboard() {  

  let data;

  try {
    data = await getDashboardData();

    const {
      coursesInProgress = 0,
      completedCourses = 0,
      adminsInProgress = 0,
      completedAdmins = 0,
    } = data || {};

    return (
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          
          <Link
            href="/dashboard/admins"
            className="px-6 py-3 bg-slate-600 text-white font-medium rounded-lg hover:bg-slate-700 transition"
          >
            Admin Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <InfoCard 
            iconName="Clock" 
            label="Admins In Progress" 
            numberOfItems={adminsInProgress} 
            variant="default" 
            singular="admin" 
            plural="admins" 
          />
          <InfoCard 
            iconName="CheckCircle" 
            label="Live Admins" 
            numberOfItems={completedAdmins} 
            variant="success" 
            singular="admin" 
            plural="admins" 
          />
          <InfoCard 
            iconName="Clock" 
            label="Courses In Progress" 
            numberOfItems={coursesInProgress} 
            variant="default" 
            singular="course" 
            plural="courses" 
          />
          <InfoCard 
            iconName="CheckCircle" 
            label="Live Courses" 
            numberOfItems={completedCourses} 
            variant="success" 
            singular="course" 
            plural="courses" 
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
          <p className="text-red-500 text-sm mt-1">
            Data may be temporarily unavailable. Please refresh.
          </p>
        </div>
      </div>
    );
  }
}