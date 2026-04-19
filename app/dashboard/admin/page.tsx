"use client";

import { RoleGate } from "@/components/dashboard/role-gate";
import { AdminView } from "@/components/dashboard/admin-view";

export default function AdminDashboardHomePage() {
  return (
    <RoleGate forRole="admin">
      <AdminView />
    </RoleGate>
  );
}
