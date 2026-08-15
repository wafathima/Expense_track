"use client";

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

type ChartData = {
  name: string;
  value: number;
  color?: string;
};

type BarChartProps = {
  data: ChartData[];
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
};

const COLORS = ["#1B4B34", "#2F8F5B", "#6FAE8C", "#B8862B", "#D8B84A", "#7A9E85", "#4E9B6E", "#A79F7E"];

const formatTooltipValue = (value: number | string) => {
  return [`₹${Number(value).toFixed(2)}`, "Amount"];
};

export default function BarChart({ data, title, xAxisLabel, yAxisLabel }: BarChartProps) {
  return (
    <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
      <h3
        className="mb-4 text-lg font-semibold text-[#123423]"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#D9CFA6" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#7A7358", fontSize: 12 }}
            axisLine={{ stroke: "#D9CFA6" }}
            tickLine={{ stroke: "#D9CFA6" }}
            label={xAxisLabel ? { value: xAxisLabel, position: "insideBottom", offset: -5, fill: "#7A7358" } : undefined}
          />
          <YAxis
            tick={{ fill: "#7A7358", fontSize: 12 }}
            axisLine={{ stroke: "#D9CFA6" }}
            tickLine={{ stroke: "#D9CFA6" }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: "insideLeft", fill: "#7A7358" } : undefined}
          />
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: "#FBF9EF",
              border: "1px solid #D9CFA6",
              borderRadius: "8px",
              color: "#123423",
            }}
            labelStyle={{ color: "#123423", fontWeight: 600 }}
            itemStyle={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Legend wrapperStyle={{ color: "#4B4630", fontSize: 13 }} />
          <Bar dataKey="value" fill="#1B4B34" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}