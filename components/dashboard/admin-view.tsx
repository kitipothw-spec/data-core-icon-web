"use client";

import { AdminCourseManagement } from "@/components/dashboard/admin-course-management";
import { AdminUserManagement } from "@/components/dashboard/admin-user-management";

export function AdminView() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h1 className="text-2xl font-bold text-slate-900">จัดการระบบ DATA-CORE-ICON</h1>
        <p className="text-sm text-slate-600">
          จัดการผู้ใช้และซิงค์ข้อมูลหลักสูตรจากแหล่งภายนอก (ข้อมูลจำลอง)
        </p>
      </header>
      <AdminUserManagement />
      <AdminCourseManagement />
    </div>
  );
}
