"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

export type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
};

const demoUsers: UserRow[] = [
  {
    id: "U-1024",
    firstName: "สมชาย",
    lastName: "ใจดี",
    email: "somchai@school.go.th",
    role: "ครู",
    department: "คณิตศาสตร์",
  },
  {
    id: "U-1025",
    firstName: "วิภา",
    lastName: "รุ่งเรือง",
    email: "wipa@school.go.th",
    role: "ผู้บริหาร",
    department: "บริหารสถานศึกษา",
  },
  {
    id: "U-1026",
    firstName: "อานนท์",
    lastName: "แสงทอง",
    email: "anont@region.go.th",
    role: "แอดมิน",
    department: "นวัตกรรมการศึกษา",
  },
];

export function AdminUserManagement() {
  return (
    <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">จัดการผู้ใช้</h2>
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-5 py-2.5 text-sm font-bold text-white shadow-md"
        >
          <Plus className="h-4 w-4" />
          เพิ่มผู้ใช้
        </button>
      </div>
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
            {demoUsers.map((u) => (
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
                      className="rounded-xl border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50"
                      aria-label={`แก้ไข ${u.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
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
