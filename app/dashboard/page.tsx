"use client";

import { useAuth } from "@/contexts/auth-context";
import { AdminView } from "@/components/dashboard/admin-view";
import { ExecutiveView } from "@/components/dashboard/executive-view";
import { TeacherView } from "@/components/dashboard/teacher-view";

export default function DashboardPage() {
  const { user, role, authReady } = useAuth();

  if (!authReady) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        กำลังโหลด...
      </div>
    );
  }

  if (!user || !role) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-slate-600">
        กำลังนำทางไปหน้าเข้าสู่ระบบ...
      </div>
    );
  }

  if (role === "teacher") {
    return <TeacherView teacherName={user.name} />;
  }

  if (role === "executive") {
    return <ExecutiveView />;
  }

  return <AdminView />;
}
