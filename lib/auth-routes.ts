import type { UserRole } from "@/contexts/auth-context";

/** หน้าแรกของแดชบอร์ดตามบทบาท */
export function getDashboardHomeForRole(role: UserRole): string {
  if (role === "executive") return "/dashboard/executive";
  if (role === "admin") return "/dashboard/admin";
  return "/dashboard/teacher";
}
