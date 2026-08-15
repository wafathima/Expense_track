"use client";

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type LineChartProps = {
  data: Array<{
    month: string;
    total: number;
    average?: number;
  }>;
  title: string;
};

export default function LineChart({ data, title }: LineChartProps) {
  return (
    <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
      <h3
        className="mb-4 text-lg font-semibold text-[#123423]"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D9CFA6" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#7A7358", fontSize: 12 }}
            axisLine={{ stroke: "#D9CFA6" }}
            tickLine={{ stroke: "#D9CFA6" }}
          />
          <YAxis
            tick={{ fill: "#7A7358", fontSize: 12 }}
            axisLine={{ stroke: "#D9CFA6" }}
            tickLine={{ stroke: "#D9CFA6" }}
          />
          <Tooltip
            formatter={(value: number) => `₹${value.toFixed(2)}`}
            contentStyle={{
              backgroundColor: "#FBF9EF",
              border: "1px solid #D9CFA6",
              borderRadius: "8px",
              color: "#123423",
            }}
            itemStyle={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Legend wrapperStyle={{ color: "#4B4630", fontSize: 13 }} />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#1B4B34"
            strokeWidth={2.5}
            dot={{ fill: "#1B4B34", r: 3 }}
            activeDot={{ r: 7, fill: "#1B4B34" }}
            name="Total Spending"
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#B8862B"
            strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ fill: "#B8862B", r: 3 }}
            name="Average Spending"
          />
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}