"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { ExecutiveView } from "@/components/dashboard/executive-view";

export default function ExecutiveDashboardHomePage() {
  return (
    <RoleGate forRole="executive">
      <ExecutiveView />
    </RoleGate>
  );
}
