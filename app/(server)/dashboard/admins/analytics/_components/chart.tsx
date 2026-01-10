// app/(admin)/analytics/_components/chart.tsx
"use client";

import { formatAmount } from "@/lib/format";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";


interface ChartData {
  name: string;
  total: number;
}

interface ChartProps {
  data: ChartData[];
  height?: number;       
  barColor?: string;
}

export const Chart = ({
  data,
  height = 400,
  barColor = "#4f46e5",     // indigo-600
}: ChartProps) => {
  if (!data?.length) {
    return (
      <div 
        className="h-[400px] flex items-center justify-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed"
      >
        No revenue data available yet
      </div>
    );
  }

  // Formatter that handles possible undefined values safely
  const valueFormatter = (value: number | undefined) => 
    value != null ? formatAmount(value, "UGX") : "—";

  const tooltipFormatter = (value: number | undefined): [string, string] => [
    valueFormatter(value),
    "Revenue",
  ];

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 24, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false} 
            stroke="hsl(var(--border))"
          />
          
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={70}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          
          <YAxis
            tickFormatter={valueFormatter}
            tick={{ fontSize: 12, fill: "hsl(var(--foreground))" }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          
          <Tooltip
            formatter={tooltipFormatter}
            labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))" }}
            contentStyle={{ 
              backgroundColor: "hsl(var(--popover))",
              borderColor: "hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
          />
          
          <Bar
            dataKey="total"
            fill={barColor}
            radius={[8, 8, 0, 0]}
            maxBarSize={60}
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};