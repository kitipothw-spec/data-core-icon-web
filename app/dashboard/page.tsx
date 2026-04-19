"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { getDashboardHomeForRole } from "@/lib/auth-routes";

export default function DashboardIndexPage() {
  const router = useRouter();
  const { user, role, authReady } = useAuth();

  useEffect(() => {
    if (!authReady) return;
    if (!user || !role) {
      router.replace("/");
      return;
    }
    router.replace(getDashboardHomeForRole(role));
  }, [authReady, user, role, router]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
      กำลังเปลี่ยนเส้นทางตามบทบาทของคุณ...
    </div>
  );
}
