"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppUser } from "@/lib/types";

interface NavigationBarProps {
  user: AppUser | null;
}

export function NavigationBar({ user }: NavigationBarProps) {
  const router = useRouter();
  const supabase = createClient();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 60);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const guestLinks: { label: string; href: string; onClick?: () => void }[] = [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features",     href: "#features" },
    { label: "Platforms",    href: "#platforms" },
    { label: "Sign in",      href: "/auth" },
  ];

  const authLinks: { label: string; href: string; onClick?: () => void }[] = [
    { label: "Dashboard",    href: "/dashboard" },
    { label: "New Analysis", href: "/upload" },
    { label: "Sign out",     href: "#", onClick: handleLogout },
  ];

  const links = user ? authLinks : guestLinks;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none px-2 sm:px-0"
      role="navigation"
      aria-label="Main navigation"
    >
      <div
        className="pointer-events-auto bg-black rounded-b-2xl md:rounded-b-3xl flex items-center transition-all duration-500 overflow-x-auto max-w-full"
        style={{
          padding: scrolled ? "10px 28px" : "20px 48px",
          gap: scrolled ? "24px" : "40px",
          border: "1px solid rgba(225,224,204,0.18)",
          borderTop: "none",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="font-medium whitespace-nowrap transition-all duration-500"
          style={{
            color: "#E1E0CC",
            fontSize: scrolled ? "16px" : "19px",
          }}
          data-testid="nav-logo"
        >
          GoViral
        </Link>

        {/* Separator */}
        <span
          className="flex-shrink-0 transition-all duration-500"
          style={{
            width: "1px",
            height: scrolled ? "12px" : "18px",
            background: "rgba(225,224,204,0.15)",
          }}
        />

        {/* Nav links */}
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            onClick={link.onClick ? (e) => { e.preventDefault(); link.onClick!(); } : undefined}
            className="whitespace-nowrap transition-all duration-500 text-xs sm:text-sm"
            style={{
              color: "rgba(225, 224, 204, 0.7)",
              fontSize: scrolled ? "15px" : "18px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#E1E0CC")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(225, 224, 204, 0.7)")}
            data-testid={
              link.label === "Dashboard"    ? "nav-dashboard-link"    :
              link.label === "New Analysis" ? "nav-new-analysis-link" : undefined
            }
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
