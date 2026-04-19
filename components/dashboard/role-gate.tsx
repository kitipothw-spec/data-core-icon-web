"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "@/contexts/auth-context";
import { getDashboardHomeForRole } from "@/lib/auth-routes";

export function RoleGate({
  forRole,
  children,
}: {
  forRole: UserRole;
  children: ReactNode;
}) {
  const router = useRouter();
  const { role, authReady } = useAuth();

  useEffect(() => {
    if (!authReady) return;
    if (!role) {
      router.replace("/");
      return;
    }
    if (role !== forRole) {
      router.replace(getDashboardHomeForRole(role));
    }
  }, [authReady, role, router, forRole]);

  if (!authReady) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
        กำลังโหลด...
      </div>
    );
  }

  if (!role || role !== forRole) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-slate-600">
        กำลังตรวจสอบสิทธิ์...
      </div>
    );
  }

  return <>{children}</>;
}
