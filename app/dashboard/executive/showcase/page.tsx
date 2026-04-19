"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { ExecutiveShowcaseContent } from "@/components/dashboard/executive-showcase-content";

export default function ExecutiveShowcasePage() {
  return (
    <RoleGate forRole="executive">
      <ExecutiveShowcaseContent />
    </RoleGate>
  );
}
