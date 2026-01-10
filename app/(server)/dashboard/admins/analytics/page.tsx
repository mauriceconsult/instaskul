import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/actions/get-analytics";
import { Chart } from "./_components/chart";
import DataCard from "./_components/data-card";


interface AnalyticsData {
  data: { name: string; total: number }[];
  totalRevenue: number;
  totalSales: number;
  totalPublishedAdmins: number;
}

export default async function AnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const analytics = await getAnalytics(userId).catch(() => ({
    data: [],
    totalRevenue: 0,
    totalSales: 0,
    totalPublishedAdmins: 0,
  } as AnalyticsData));

  const { data, totalRevenue, totalSales } = analytics;

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your revenue and sales
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <DataCard
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat
          description="All-time earnings from courses"
        />
        <DataCard
          label="Total Sales"
          value={totalSales}
          description="Number of course purchases"
        />
        <DataCard
          label="Published Admins"
          value={analytics.totalPublishedAdmins}
          description="Active admin accounts"
        />
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Revenue by Course</h2>
        <Chart data={data} />
      </div>
    </div>
  );
}