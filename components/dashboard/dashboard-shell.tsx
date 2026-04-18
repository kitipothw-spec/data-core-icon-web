"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Award,
  FileBarChart,
  LayoutDashboard,
  LogOut,
  Target,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type NavItem = { href: string; label: string; icon: React.ReactNode };

function teacherNav(): NavItem[] {
  return [
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      href: "/dashboard/teacher/profile",
      label: "ข้อมูลส่วนตัวและเป้าหมาย",
      icon: <UserCircle className="h-5 w-5" />,
    },
    {
      href: "/dashboard/teacher/report",
      label: "รายงานการพัฒนาตนเอง",
      icon: <Target className="h-5 w-5" />,
    },
  ];
}

function executiveNav(): NavItem[] {
  return [
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard className="h-5 w-5" /> },
    {
      href: "/dashboard/executive/reports",
      label: "ศูนย์รายงานสรุปผล",
      icon: <FileBarChart className="h-5 w-5" />,
    },
    {
      href: "/dashboard/executive/showcase",
      label: "ทำเนียบครูโดดเด่น",
      icon: <Award className="h-5 w-5" />,
    },
  ];
}

function adminNav(): NavItem[] {
  return [
    { href: "/dashboard", label: "แดชบอร์ด", icon: <LayoutDashboard className="h-5 w-5" /> },
  ];
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, authReady, logout } = useAuth();

  useEffect(() => {
    if (authReady && !role) {
      router.replace("/");
    }
  }, [authReady, role, router]);

  const items = useMemo(() => {
    if (role === "teacher") return teacherNav();
    if (role === "executive") return executiveNav();
    return adminNav();
  }, [role]);

  const roleLabel = useMemo(() => {
    if (role === "teacher") return "ครู";
    if (role === "executive") return "ผู้บริหาร";
    if (role === "admin") return "แอดมิน";
    return "";
  }, [role]);

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    router.replace("/");
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-600">
        กำลังโหลดเซสชัน...
      </div>
    );
  }

  if (!role || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-600">
        กำลังนำทาง...
      </div>
    );
  }

  return (
    <div className="dashboard-app flex min-h-screen bg-[#F8FAFC] print:block print:min-h-0">
      <aside className="no-print flex w-64 shrink-0 flex-col border-r border-slate-800/80 bg-[#1e293b] text-white shadow-xl print:hidden">
        <div className="border-b border-white/10 px-5 py-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-300">
            DATA-CORE-ICON
          </p>
          <p className="mt-1 text-lg font-bold leading-tight">
            {role === "teacher" && "พื้นที่ครู"}
            {role === "executive" && "พื้นที่ผู้บริหาร"}
            {role === "admin" && "พื้นที่ผู้ดูแล"}
          </p>
          <p className="mt-3 text-xs font-semibold leading-snug text-white/80">
            {user.name}
            <span className="mt-1 block text-[11px] font-medium text-white/60">
              {roleLabel} · {user.department}
            </span>
          </p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="เมนูหลัก">
          {items.map((item) => (
            <button
              key={item.href}
              type="button"
              onClick={() => router.push(item.href)}
              className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-bold transition ${
                isActive(item.href)
                  ? "bg-white text-slate-900 shadow-md"
                  : "text-white/90 hover:bg-white/10"
              }`}
            >
              {item.icon}
              <span className="leading-snug">{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 py-3 text-sm font-bold text-white transition hover:bg-white/15"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            ออกจากระบบ
          </button>
        </div>
      </aside>
      <main className="min-h-screen flex-1 overflow-x-hidden p-6 md:p-10 print:min-h-0 print:w-full print:p-4 print:shadow-none">
        {children}
      </main>
    </div>
  );
}
