"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3, Percent, Printer } from "lucide-react";

const skillGaps = [
  { skill: "การวิเคราะห์ข้อมูล", gap: 42 },
  { skill: "สื่อดิจิทัล", gap: 55 },
  { skill: "การประเมินเชิงรูปธรรม", gap: 38 },
  { skill: "การจัดการชั้นเรียนเชิงรุก", gap: 29 },
];

const achievementRatios = [
  { name: "บรรลุเป้าพัฒนาครบถ้วน", value: 52 },
  { name: "ดำเนินการตามแผน", value: 33 },
  { name: "ต้องเร่งติดตาม", value: 15 },
];

const COLORS = ["#ea580c", "#db2777", "#0ea5e9", "#7c3aed"];

export function ExecutiveReportCenterContent() {
  return (
    <div className="print-root mx-auto max-w-6xl space-y-10">
      <div className="no-print rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h1 className="text-2xl font-bold text-slate-900">ศูนย์รายงานสรุปผล</h1>
        <p className="text-sm text-slate-600">
          สรุปช่องว่างทักษะ อัตราส่วนความสำเร็จในการพัฒนา และตัวชี้วัดภาพรวม — พร้อมพิมพ์รายงานฉบับเต็ม
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="mt-4 inline-flex items-center gap-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
        >
          <Printer className="h-4 w-4" />
          พิมพ์รายงานภาพรวม
        </button>
      </div>

      <div
        id="executive-report-print"
        className="print-document space-y-10 rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none"
      >
        <header className="border-b border-slate-200 pb-6 print:border-slate-300">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 print:text-slate-800">
            DATA-CORE-ICON · ศูนย์รายงานสรุปผล
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-900 print:text-black">
            รายงานสรุปภาพรวมการพัฒนาครู
          </h2>
          <p className="text-sm text-slate-600 print:text-slate-800">
            ช่วงเวลารายงาน: ภาคเรียนปัจจุบัน (ข้อมูลจำลอง)
          </p>
        </header>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-orange-600 print:text-slate-900" />
            <h3 className="text-lg font-bold text-slate-900 print:text-black">สรุปช่องว่างทักษะ</h3>
          </div>
          <p className="mb-4 text-sm text-slate-600 print:text-slate-800">
            ค่าที่สูงแสดงถึงความจำเป็นต้องพัฒนาในด้านนั้นมากขึ้น
          </p>
          <div className="h-72 print:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGaps}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" />
                <XAxis dataKey="skill" tick={{ fontSize: 11, fill: "#0f172a" }} />
                <YAxis tick={{ fontSize: 11, fill: "#0f172a" }} />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0)}`, "คะแนนช่องว่าง"]}
                  contentStyle={{ borderRadius: 12 }}
                />
                <Bar dataKey="gap" fill="#ea580c" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-center gap-2">
            <Percent className="h-5 w-5 text-pink-600 print:text-slate-900" />
            <h3 className="text-lg font-bold text-slate-900 print:text-black">
              อัตราส่วนความสำเร็จในการพัฒนา (Achievement Ratios)
            </h3>
          </div>
          <p className="mb-4 text-sm text-slate-600 print:text-slate-800">
            สัดส่วนครูตามสถานะการบรรลุแผนพัฒนาวิชาชีพ
          </p>
          <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-center">
            <div className="h-72 w-full max-w-md">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={achievementRatios}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={56}
                    outerRadius={96}
                    paddingAngle={2}
                  >
                    {achievementRatios.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, "สัดส่วน"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="w-full max-w-sm space-y-2 text-sm print:text-black">
              {achievementRatios.map((a, i) => (
                <li
                  key={a.name}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-2 print:border-slate-800"
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <span
                      className="h-3 w-3 rounded-sm print:border print:border-slate-800"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    {a.name}
                  </span>
                  <span>{a.value}%</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 print:border-slate-800 print:bg-white">
          <h3 className="text-base font-bold text-slate-900 print:text-black">สรุปผู้บริหาร</h3>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm text-slate-700 print:text-slate-900">
            <li>ช่องว่างทักษะด้านสื่อดิจิทัลยังสูง — ควรจัดสรรหลักสูตรเสริมในรอบถัดไป</li>
            <li>ครูร้อยละ 52 บรรลุเป้าพัฒนาครบถ้วน — เป้าหมายภาพรวมอยู่ในเกณฑ์ดี</li>
            <li>กลุ่มที่ต้องเร่งติดตาม (15%) ควรได้รับการพูดคุยแผนรายบุคคล</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
