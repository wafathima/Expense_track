"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const linkClass = (active: boolean) =>
    `relative px-4 py-2 rounded-lg font-medium transition-colors ${
      active
        ? "bg-[#1B4B34] text-[#F5F1E4]"
        : "text-[#4B4630] hover:bg-[#F0ECD9]"
    }`;

  return (
    <nav
      className="mb-8 border-b border-[#D9CFA6]"
      style={{
        backgroundColor: "rgba(239, 234, 217, 0.85)", 
        backgroundImage:
          "repeating-linear-gradient(115deg, rgba(27,75,52,0.05) 0px, rgba(27,75,52,0.05) 1px, transparent 1px, transparent 16px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 md:px-8">
        <Link href="/" className={linkClass(pathname === "/")}>
          Expenses
          {pathname === "/" && (
            <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-[#B8862B]" />
          )}
        </Link>
        <Link href="/analytics" className={linkClass(pathname === "/analytics")}>
          Analytics
          {pathname === "/analytics" && (
            <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-[#B8862B]" />
          )}
        </Link>
      </div>
    </nav>
  );
}