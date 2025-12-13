"use client";

// import { useRef } from "react";
import { Chart as ChartJS, registerables } from "chart.js";
import { Chart as ChartReact } from "react-chartjs-2";
// import type { ChartJS } from "chart.js";
import { useRef } from "react";

// Register Chart.js components
ChartJS.register(...registerables);

// Define type based on getAnalytics output
type AnalyticsData = {
  name: string;
  total: number;
}[];

interface AnalyticsChartProps {
  data: AnalyticsData;
}

export const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  const chartRef = useRef<ChartJS<"bar", number[], string> | null>(null);

  // Transform data for Chart.js
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: "Analytics",
        data: data.map((item) => item.total),
        backgroundColor: ["#3b82f6", "#10b981", "#ef4444", "#f59e0b"],
        borderColor: ["#1e3a8a", "#047857", "#b91c1c", "#b45309"],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
    },
  };

  return (
    <div className="w-full h-96">
      <ChartReact type="bar" data={chartData} options={options} ref={chartRef} />
    </div>
  );
};
