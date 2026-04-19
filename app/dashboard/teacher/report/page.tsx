"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { TeacherDevelopmentReportContent } from "@/components/dashboard/teacher-development-report-content";

export default function TeacherDevelopmentReportPage() {
  return (
    <RoleGate forRole="teacher">
      <TeacherDevelopmentReportContent />
    </RoleGate>
  );
}
