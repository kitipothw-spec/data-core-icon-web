"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { ExecutiveReportCenterContent } from "@/components/dashboard/executive-report-center-content";

export default function ExecutiveReportsPage() {
  return (
    <RoleGate forRole="executive">
      <ExecutiveReportCenterContent />
    </RoleGate>
  );
}
