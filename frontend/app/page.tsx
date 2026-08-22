// frontend/app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "./context/AuthContext";

export default function LandingPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state
  if (loading) {
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

  // If authenticated, don't show landing page (will redirect)
  if (isAuthenticated) {
    return null;
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)",
        backgroundImage:
          "repeating-linear-gradient(115deg, rgba(27,75,52,0.05) 0px, rgba(27,75,52,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(25deg, rgba(184,134,43,0.045) 0px, rgba(184,134,43,0.045) 1px, transparent 1px, transparent 16px)",
      }}
    >
      <div className="w-full max-w-4xl">
        {/* Hero Section */}
        <div className="text-center">
          {/* Logo/Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#1B4B34] text-[#F5F1E4] text-3xl mb-6 shadow-lg">
            💰
          </div>

          <h1 
            className="text-4xl md:text-6xl font-bold text-[#123423] mb-4"
            style={{ fontFamily: "'Fraunces', Georgia, serif" }}
          >
            Expense Tracker
          </h1>
          
          <p className="text-lg md:text-xl text-[#4B4630] mb-8 max-w-2xl mx-auto">
            Take control of your finances. Track expenses, analyze spending, 
            and achieve your financial goals.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-[#1B4B34] text-[#F5F1E4] font-semibold rounded-lg hover:bg-[#153A29] transition shadow-lg shadow-[#1B4B34]/20 min-w-[160px] text-center"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border-2 border-[#1B4B34] text-[#1B4B34] font-semibold rounded-lg hover:bg-[#1B4B34] hover:text-[#F5F1E4] transition min-w-[160px] text-center"
            >
              Sign In
            </Link>
          </div>

          {/* Features Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-[#D9CFA6]">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="font-semibold text-[#123423] mb-1">Track Spending</h3>
              <p className="text-sm text-[#8A8264]">Monitor every expense in one place</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-[#D9CFA6]">
              <div className="text-3xl mb-3">📈</div>
              <h3 className="font-semibold text-[#123423] mb-1">Smart Analytics</h3>
              <p className="text-sm text-[#8A8264]">Visualize your spending patterns</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm p-6 rounded-xl border border-[#D9CFA6]">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="font-semibold text-[#123423] mb-1">Secure & Private</h3>
              <p className="text-sm text-[#8A8264]">Your data is encrypted and safe</p>
            </div>
          </div>

          {/* Testimonial */}
          <div className="mt-12 bg-white/40 backdrop-blur-sm p-6 rounded-xl border border-[#D9CFA6] max-w-2xl mx-auto">
            <p className="text-[#4B4630] italic">
              This expense tracker has completely changed how I manage my money. 
              Simple, beautiful, and effective!
            </p>
            <p className="text-sm text-[#8A8264] mt-2">— Happy User</p>
          </div>
        </div>
      </div>
    </main>
  );
}