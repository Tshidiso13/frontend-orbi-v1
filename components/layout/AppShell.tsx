"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({
  children,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const savedState = localStorage.getItem(
      "sidebar-collapsed"
    );

    if (savedState !== null) {
      setCollapsed(savedState === "true");
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsed((previous) => {
      const next = !previous;

      localStorage.setItem(
        "sidebar-collapsed",
        String(next)
      );

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={toggleSidebar}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile hamburger */}
      {!mobileOpen && (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open sidebar"
          className="
            fixed left-4 top-4 z-40
            flex h-11 w-11 items-center justify-center
            rounded-xl border border-zinc-200
            bg-white dark:bg-zinc-950 text-zinc-700 shadow-sm
            transition hover:bg-zinc-50
            md:hidden
          "
        >
          <Menu size={21} />
        </button>
      )}

      {/* Page content */}
      <main
        className={`
          min-h-screen
          transition-[padding] duration-300 ease-in-out

          pl-0

          ${
            collapsed
              ? "md:pl-[72px]"
              : "md:pl-[260px]"
          }
        `}
      >
        {children}
      </main>
    </div>
  );
}