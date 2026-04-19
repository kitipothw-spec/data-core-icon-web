"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { TeacherResourceHubContent } from "@/components/dashboard/teacher-resource-hub-content";

export default function TeacherResourceHubPage() {
  return (
    <RoleGate forRole="teacher">
      <TeacherResourceHubContent />
    </RoleGate>
  );
}
