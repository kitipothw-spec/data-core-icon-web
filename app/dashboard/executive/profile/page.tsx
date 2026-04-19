"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { ExecutiveProfileContent } from "@/components/dashboard/executive-profile-content";

export default function ExecutiveProfilePage() {
  return (
    <RoleGate forRole="executive">
      <ExecutiveProfileContent />
    </RoleGate>
  );
}
