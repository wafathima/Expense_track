// frontend/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth(); 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, redirect to home
  if (isAuthenticated) {
    router.push("/");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData.email, formData.password);
      // login() handles redirect
    } catch (error: any) {
      setError(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ 
      backgroundColor: "rgba(239, 234, 217, 0.85)",
      backgroundImage: "repeating-linear-gradient(115deg, rgba(27,75,52,0.05) 0px, rgba(27,75,52,0.05) 1px, transparent 1px, transparent 16px), repeating-linear-gradient(25deg, rgba(184,134,43,0.045) 0px, rgba(184,134,43,0.045) 1px, transparent 1px, transparent 16px)"
    }}>
      <div className="w-full max-w-md">
        <div className="bg-[#FBF9EF] rounded-2xl border border-[#D9CFA6] p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-[#123423]" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
              Welcome Back
            </h1>
            <p className="text-[#8A8264] mt-2">Sign in to track your expenses</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#4B4630] mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#D9CFA6] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B34] focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#4B4630] mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#D9CFA6] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B34] focus:border-transparent"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1B4B34] text-[#F5F1E4] py-3 rounded-lg font-medium hover:bg-[#153A29] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#8A8264]">
            Do not have an account?{" "}
            <Link href="/register" className="text-[#1B4B34] font-medium hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}