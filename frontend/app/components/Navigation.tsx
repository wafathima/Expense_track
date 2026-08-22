// frontend/components/Navigation.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated, loading } = useAuth();

  // Don't show navigation on landing page or auth pages
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isLandingPage || isAuthPage) {
    return null;
  }

  const linkClass = (active: boolean) =>
    `relative px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? "bg-[#1B4B34] text-[#F5F1E4]"
        : "text-[#4B4630] hover:bg-[#F0ECD9]"
    }`;

  if (loading) {
    return (
      <nav className="mb-8 border-b border-[#D9CFA6] bg-[#EFEAD9]/85">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-8">
          <div className="h-8 w-20 animate-pulse rounded bg-[#D9CFA6]" />
        </div>
      </nav>
    );
  }

  return (
    <nav
      className="border-b border-[#D9CFA6]"
      style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)",
        backgroundImage:
          "repeating-linear-gradient(115deg, rgba(27,75,52,0.05) 0px, rgba(27,75,52,0.05) 1px, transparent 1px, transparent 16px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className={linkClass(pathname === "/dashboard")}>
            Expenses
            {pathname === "/dashboard" && (
              <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-[#B8862B]" />
            )}
          </Link>
          
          <Link href="/dashboard/analytics" className={linkClass(pathname === "/dashboard/analytics")}>
            Analytics
            {pathname === "/dashboard/analytics" && (
              <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-[#B8862B]" />
            )}
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-[#4B4630] flex items-center gap-1">
            <span className="px-5 py-1 text-sm font-medium text-[#4B4630] hover:bg-[#B8862B] rounded-lg transition-colors border border-[#B8862B] ">👤{user?.name}</span>
          </span>
          <button
            onClick={logout}
            className="px-5 py-1 text-sm font-medium text-[#4B4630] hover:bg-[#F0ECD9] rounded-lg transition-colors border border-[#D9CFA6]"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}