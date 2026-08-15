"use client";

import { useState, useEffect } from "react";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import LineChart from "./LineChart";
import api from "../../../services/api";

type MonthlyData = {
  month: string;
  total: number;
  average: number;
};

type CategoryData = {
  name: string;
  value: number;
  color?: string;
};

type CategorySummary = {
  id: number;
  category: string;
  expense_count: string;
  total_amount: string;
  icon?: string;
  color?: string;
};

export default function DashboardCharts() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, []);

  const fetchChartData = async () => {
    try {
      setLoading(true);

      const monthlyResponse = await api.get("/analytics/monthly");
      const monthly = monthlyResponse.data.map((item: any) => ({
        month: new Date(item.month).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        }),
        total: Number(item.total_amount),
        average: Number(item.average_amount),
      }));
      setMonthlyData(monthly);

      const categoryResponse = await api.get("/analytics/by-category");
      const categories = categoryResponse.data.map((item: CategorySummary) => ({
        name: item.category,
        value: Number(item.total_amount),
        color: item.color || undefined,
      }));
      setCategoryData(categories);
    } catch (error) {
      console.error("Failed to fetch chart data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
          <div className="h-64 animate-pulse rounded-lg bg-[#E4DEC2]"></div>
        </div>
        <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
          <div className="h-64 animate-pulse rounded-lg bg-[#E4DEC2]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <BarChart data={categoryData} title="Spending by Category" yAxisLabel="Amount (₹)" />
        <PieChart data={categoryData} title="Category Distribution" />
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        <LineChart data={monthlyData} title="Monthly Spending Trend" />
      </div>
    </div>
  );
}