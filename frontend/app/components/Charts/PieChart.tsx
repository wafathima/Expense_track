"use client";

import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type ChartData = {
  name: string;
  value: number;
  color?: string;
};

type PieChartProps = {
  data: ChartData[];
  title: string;
};

const COLORS = ["#1B4B34", "#2F8F5B", "#6FAE8C", "#B8862B", "#D8B84A", "#7A9E85", "#4E9B6E", "#A79F7E"];



const formatTooltipValue = (value: unknown) => {
  return [`₹${Number(value ?? 0).toFixed(2)}`, "Amount"];
};



const renderCustomLabel = ({ name, percent }: any) => {
  return `${name ?? ""}: ${((percent ?? 0) * 100).toFixed(0)}%`;
};

export default function PieChart({ data, title }: PieChartProps) {
  return (
    <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
      <h3
        className="mb-4 text-lg font-semibold text-[#123423]"
        style={{ fontFamily: "'Fraunces', Georgia, serif" }}
      >
        {title}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            dataKey="value"
            stroke="#FBF9EF"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={formatTooltipValue}
            contentStyle={{
              backgroundColor: "#FBF9EF",
              border: "1px solid #D9CFA6",
              borderRadius: "8px",
              color: "#123423",
            }}
            itemStyle={{ fontFamily: "'JetBrains Mono', monospace" }}
          />
          <Legend wrapperStyle={{ color: "#4B4630", fontSize: 13 }} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}