"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { supabase } from "@/lib/supabase";

export type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
};

function splitName(full: string | null): { firstName: string; lastName: string } {
  const t = (full ?? "").trim();
  if (!t) return { firstName: "-", lastName: "-" };
  const parts = t.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0]!, lastName: "-" };
  return { firstName: parts[0]!, lastName: parts.slice(1).join(" ") };
}

function roleLabelTh(role: string | null): string {
  if (role === "teacher") return "ครู";
  if (role === "executive") return "ผู้บริหาร";
  if (role === "admin") return "แอดมิน";
  return role ?? "-";
}

export function AdminUserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setUsers([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role, department")
        .order("full_name", { ascending: true });
      if (error) throw error;
      const rows = (data ?? []) as {
        id: string;
        email: string | null;
        full_name: string | null;
        role: string | null;
        department: string | null;
      }[];
      setUsers(
        rows.map((r) => {
          const { firstName, lastName } = splitName(r.full_name);
          return {
            id: r.id,
            firstName,
            lastName,
            email: r.email ?? "-",
            role: roleLabelTh(r.role),
            department: r.department?.trim() || "-",
          };
        }),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function handleDeleteUser(id: string) {
    if (!window.confirm("ลบโปรไฟล์ผู้ใช้นี้จากระบบหรือไม่? (บัญชี Auth ยังอยู่ — ลบผู้ใช้ Auth ได้ที่ Supabase Dashboard)")) {
      return;
    }
    try {
      const { error } = await supabase.from("profiles").delete().eq("id", id);
      if (error) throw error;
      await loadUsers();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">จัดการผู้ใช้</h2>
        <button
          type="button"
          onClick={() =>
            alert("กรุณาเพิ่มบัญชีใหม่ผ่าน Supabase Dashboard > Authentication")
          }
          className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-md"
        >
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </button>
      </div>
      {loading ? (
        <p className="py-8 text-center text-sm font-semibold text-slate-600">กำลังโหลดข้อมูลผู้ใช้...</p>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="rounded-l-2xl bg-slate-100 px-3 py-3">ID</th>
              <th className="bg-slate-100 px-3 py-3">ชื่อ</th>
              <th className="bg-slate-100 px-3 py-3">นามสกุล</th>
              <th className="bg-slate-100 px-3 py-3">อีเมล</th>
              <th className="bg-slate-100 px-3 py-3">สิทธิ์</th>
              <th className="bg-slate-100 px-3 py-3">แผนกวิชา</th>
              <th className="rounded-r-2xl bg-slate-100 px-3 py-3 text-right">การทำงาน</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{u.id}</td>
                <td className="px-3 py-3 font-semibold text-slate-900">{u.firstName}</td>
                <td className="px-3 py-3 text-slate-800">{u.lastName}</td>
                <td className="px-3 py-3 text-slate-700">{u.email}</td>
                <td className="px-3 py-3">
                  <span className="rounded-full bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">
                    {u.role}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700">{u.department}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => void handleDeleteUser(u.id)}
                      className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-700 hover:bg-red-100"
                      aria-label={`ลบ ${u.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
