// frontend/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth(); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      // register() handles redirect
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      if (error.response?.data?.errors) {
        setError(error.response.data.errors.join(", "));
      } else {
        setError(errorMessage);
      }
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
              Create Account
            </h1>
            <p className="text-[#8A8264] mt-2">Start tracking your expenses today</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#4B4630] mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-[#D9CFA6] bg-white focus:outline-none focus:ring-2 focus:ring-[#1B4B34] focus:border-transparent"
                placeholder="John Doe"
                minLength={2}
              />
            </div>

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
              <p className="text-xs text-[#8A8264] mt-1">Must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#4B4630] mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[#8A8264]">
            Already have an account?{" "}
            <Link href="/login" className="text-[#1B4B34] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}