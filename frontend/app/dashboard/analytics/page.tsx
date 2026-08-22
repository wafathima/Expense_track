// frontend/app/dashboard/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import api from "../../../services/api";
import DashboardCharts from "../../components/Charts/DashboardCharts";

type ExpenseSummary = {
  total_expenses: string;
  total_amount: string;
  average_amount: string;
  highest_amount: string;
};

export default function AnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [summary, setSummary] = useState<ExpenseSummary>({
    total_expenses: "0",
    total_amount: "0",
    average_amount: "0",
    highest_amount: "0",
  });
  const [loadingData, setLoadingData] = useState(true);

  // Redirect to landing if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router]);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchSummary();
    }
  }, [isAuthenticated]);

  const fetchSummary = async () => {
    try {
      const response = await api.get("/analytics/summary");
      setSummary(response.data);
    } catch (error) {
      console.error("Failed to fetch summary:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Show loading while checking auth
  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)",
      }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1B4B34] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-[#8A8264]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen px-4 py-8 md:px-8"
      style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)", 
        backgroundImage:
          "repeating-linear-gradient(115deg, rgba(27,75,52,0.05) 0px, rgba(27,75,52,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(25deg, rgba(184,134,43,0.045) 0px, rgba(184,134,43,0.045) 1px, transparent 1px, transparent 16px)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="relative mb-10 overflow-hidden rounded-2xl px-8 py-10 shadow-lg md:px-12 md:py-14"
          style={{ background: "linear-gradient(135deg, #0E2A1F 0%, #163B29 55%, #1B4B34 100%)" }}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.14]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(115deg, transparent 0px, transparent 6px, rgba(216,184,74,0.6) 6px, rgba(216,184,74,0.6) 7px)",
            }}
          />
          <p className="relative mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#8FBF9F]">
            Insights
          </p>
          <h1
            className="relative text-4xl font-semibold text-[#F5F1E4] md:text-5xl"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Analytics Dashboard
          </h1>
          <p className="relative mt-3 max-w-md text-[#BFDAC7]">
            Visual insights into your spending habits.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SummaryCard label="Total Spending" value={`₹${Number(summary.total_amount).toFixed(2)}`} accent />
          <SummaryCard label="Total Expenses" value={summary.total_expenses} />
          <SummaryCard
            label="Average Expense"
            value={`₹${Number(summary.average_amount).toFixed(2)}`}
          />
          <SummaryCard
            label="Highest Expense"
            value={`₹${Number(summary.highest_amount).toFixed(2)}`}
            gold
          />
        </div>

        {!loadingData && (
          <div className="rounded-2xl border border-[#D9CFA6] bg-[#FBF9EF] p-6 shadow-sm">
            <DashboardCharts />
          </div>
        )}
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  accent,
  gold,
}: {
  label: string;
  value: string;
  accent?: boolean;
  gold?: boolean;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-[#D9CFA6] bg-[#FBF9EF] p-5 shadow-sm">
      <div
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background: gold
            ? "linear-gradient(90deg, #B8862B, #E4C766)"
            : "linear-gradient(90deg, #1B4B34, #4E9B6E)",
        }}
      />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7A7358]">{label}</p>
      <p
        className={`mt-2 font-mono text-2xl font-semibold ${
          gold ? "text-[#8A6111]" : accent ? "text-[#1B4B34]" : "text-[#123423]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}