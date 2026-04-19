"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { TeacherView } from "@/components/dashboard/teacher-view";
import { useAuth } from "@/contexts/auth-context";

export default function TeacherDashboardHomePage() {
  const { user } = useAuth();
  return (
    <RoleGate forRole="teacher">
      <TeacherView teacherName={user?.name ?? "ครู"} />
    </RoleGate>
  );
}
