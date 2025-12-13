import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getAnalytics } from "@/actions/get-analytics";
import { AnalyticsChart } from "./_components/chart";
import { DataCard } from "./_components/data-card";

export default async function AdminAnalyticsPage() {
  const { userId } = await auth();
  if (!userId) {
    return redirect("/");
  }

  const { data, totalRevenue, totalSales } = await getAnalytics(userId);

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <DataCard label="Total Sales" value={totalSales} shouldFormat={false} />
        <DataCard
          label="Total Revenue"
          value={totalRevenue}
          shouldFormat={true}
        />
      </div>
      <AnalyticsChart data={data} />
    </div>
  );
}
