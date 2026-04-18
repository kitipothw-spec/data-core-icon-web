"use client";

import { startTransition, useEffect, useState } from "react";
import Image from "next/image";
import { FileText, Printer } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  loadPortfolioItems,
  loadTeacherProfile,
  type PortfolioItem,
  type TeacherProfileState,
} from "@/lib/teacher-storage";
import { VocationalRadarChart } from "@/components/dashboard/vocational-radar-chart";

export function TeacherDevelopmentReportContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<TeacherProfileState | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    startTransition(() => {
      setProfile(loadTeacherProfile());
      setItems(loadPortfolioItems());
    });
  }, []);

  const displayName = profile?.displayName || user?.name || "ครูผู้ใช้";
  const dept = profile?.department || user?.department || "-";

  return (
    <div className="print-root mx-auto max-w-6xl space-y-10">
      <div className="no-print">
        <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-900">รายงานการพัฒนาตนเอง</h1>
          <p className="text-sm text-slate-600">
            สรุปพอร์ตโฟลิโอกิจกรรมและกราฟทักษะครูอาชีวะ — พิมพ์เป็น PDF ผ่านเมนูของเบราว์เซอร์
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 inline-flex items-center gap-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
          >
            <Printer className="h-4 w-4" />
            พิมพ์รายงาน (PDF)
          </button>
        </header>
      </div>

      <div
        id="teacher-report-print"
        className="print-document space-y-8 rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none"
      >
        <div className="border-b border-slate-200 pb-6 print:border-slate-300">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-slate-800">
            DATA-CORE-ICON · รายงานการพัฒนาตนเอง
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900 print:text-black">
            {displayName}
          </h2>
          <p className="text-sm text-slate-600 print:text-slate-800">แผนกวิชา: {dept}</p>
          <p className="mt-4 text-sm text-slate-700 print:text-slate-900">
            <span className="font-semibold">เป้าหมายปีการศึกษา: </span>
            {profile?.academicYearGoals?.trim()
              ? profile.academicYearGoals
              : "— (บันทึกได้ที่เมนู ข้อมูลส่วนตัวและเป้าหมาย)"}
          </p>
          {profile ? (
            <p className="mt-2 text-sm text-slate-700 print:text-slate-900">
              <span className="font-semibold">ความสำเร็จตามเป้าหมาย: </span>
              {profile.goalAchievementPercent}%
            </p>
          ) : null}
        </div>

        <section>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 print:text-black">
            <FileText className="no-print h-5 w-5 text-orange-500" />
            กราฟทักษะครูอาชีวะ
          </h3>
          <p className="mb-4 text-sm text-slate-600 print:text-slate-800">
            แสดงสมรรถนะหลัก 5–6 ด้านสำหรับครูอาชีวศึกษา (ข้อมูลจำลอง)
          </p>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 print:border-slate-300 print:bg-white">
            <VocationalRadarChart gradientId="vocPrintGradient" />
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold text-slate-900 print:text-black">
            รายการพอร์ตโฟลิโอทั้งหมด
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse border border-slate-200 text-sm print:border-slate-800">
              <thead>
                <tr className="bg-slate-100 text-left print:bg-slate-200">
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    ลำดับ
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    ชื่อกิจกรรม
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    หมวดหมู่
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    ระดับ
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    วันที่
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    เป้าหมายที่เกี่ยวข้อง
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-slate-200 px-3 py-6 text-center text-slate-500 print:border-slate-800"
                    >
                      ยังไม่มีรายการ — เพิ่มได้จากแดชบอร์ดหลัก
                    </td>
                  </tr>
                ) : (
                  items.map((row, i) => (
                    <tr key={row.id} className="print:text-black">
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {i + 1}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 font-medium print:border-slate-800">
                        {row.title}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {row.category}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {row.level}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {row.date}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        <span className="rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                          {row.relatedGoal || "ไม่ระบุเป้าหมาย"} · +{row.goalContributionPercent}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500 print:border-slate-300 print:text-slate-700">
          <p>เอกสารนี้จัดทำจากระบบ DATA-CORE-ICON เพื่อการรายงานการพัฒนาตนเอง</p>
          <div className="mt-2 flex items-center gap-2 print:hidden">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&q=80"
                alt=""
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span>ลายเซ็นผู้รายงาน (สาธิต)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
