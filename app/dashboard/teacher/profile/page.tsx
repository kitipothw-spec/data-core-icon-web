"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { TeacherProfileContent } from "@/components/dashboard/teacher-profile-content";

export default function TeacherProfilePage() {
  return (
    <RoleGate forRole="teacher">
      <TeacherProfileContent />
    </RoleGate>
  );
}
