"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/app-data-context";
import { aiInsightForWorkload, workloadTotalHours } from "@/lib/workload-mock";

const COLORS = ["#fb923c", "#f472b6", "#38bdf8", "#a78bfa", "#34d399"];

const EMPTY_SKILL = [{ skill: "กำลังโหลดหรือยังไม่มีข้อมูล", gap: 0 }];
const EMPTY_TREND = [{ category: "ยังไม่มีกิจกรรม", count: 0 }];
const EMPTY_PORTFOLIO = [
  { level: "ตนเอง", count: 0 },
  { level: "ชุมชน", count: 0 },
  { level: "สถานศึกษา", count: 0 },
  { level: "จังหวัด", count: 0 },
  { level: "ชาติ", count: 0 },
  { level: "นานาชาติ", count: 0 },
  { level: "อื่น ๆ", count: 0 },
];
const EMPTY_COURSE = [{ category: "ยังไม่มีข้อมูลเป้าหมาย", availableCourses: 0, trainedTeachers: 0 }];

function riskBadgeClasses(level: "low" | "medium" | "high") {
  if (level === "low") return "bg-emerald-100 text-emerald-800 ring-emerald-200";
  if (level === "medium") return "bg-amber-100 text-amber-900 ring-amber-200";
  return "bg-rose-100 text-rose-800 ring-rose-200";
}

function riskLabelTh(level: "low" | "medium" | "high") {
  if (level === "low") return "ต่ำ (ปลอดภัย)";
  if (level === "medium") return "ปานกลาง (เฝ้าระวัง)";
  return "สูง (เสี่ยงหมดไฟ)";
}

function riskDotFill(level: "low" | "medium" | "high") {
  if (level === "low") return "#10b981";
  if (level === "medium") return "#f59e0b";
  return "#f43f5e";
}

export function ExecutiveView() {
  const { user, usesSupabase } = useAuth();
  const {
    executiveWorkload,
    executiveDashboard,
    executiveDashboardLoading,
    refreshExecutiveDashboard,
  } = useAppData();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPortfolioLevel, setSelectedPortfolioLevel] = useState<"ชาติ" | "นานาชาติ" | null>(
    null,
  );
  const initials = (() => {
    if (!user?.name) return "E";
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "E";
  })();

  const skillGaps = executiveDashboard?.skillGaps ?? EMPTY_SKILL;
  const trainingTrends = executiveDashboard?.trainingTrends ?? EMPTY_TREND;
  const portfolioByLevel = executiveDashboard?.portfolioByLevel ?? EMPTY_PORTFOLIO;
  const courseOverviewRows = executiveDashboard?.courseOverviewRows ?? EMPTY_COURSE;
  const courseDetailsByCategory = executiveDashboard?.courseDetailsByCategory ?? {};
  const nationalPortfolioDetails = executiveDashboard?.nationalPortfolioDetails ?? [];
  const internationalPortfolioDetails = executiveDashboard?.internationalPortfolioDetails ?? [];

  const workloadRows = executiveDashboard?.executiveWorkload?.length
    ? executiveDashboard.executiveWorkload
    : executiveWorkload;

  const workloadChartPoints = workloadRows.map((row) => ({
    dept: row.dept,
    workload: workloadTotalHours(row),
    engagement: row.engagementScore,
    risk: row.riskLevel,
  }));

  const aiInsightText =
    executiveDashboard?.aiInsightText ?? aiInsightForWorkload(workloadRows);

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-orange-600">มุมมองผู้บริหาร</p>
            <h1 className="text-2xl font-bold text-slate-900">แดชบอร์ดวิเคราะห์</h1>
            <p className="text-sm text-slate-600">
              แสดงเฉพาะข้อมูลเชิงวิเคราะห์ ช่องว่างทักษะ แนวโน้มการอบรม และสรุปพอร์ตตามระดับกิจกรรม
            </p>
            {usesSupabase ? (
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                เชื่อมต่อ Supabase — สรุปจากตาราง profiles · goals · activities
              </p>
            ) : null}
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {executiveDashboardLoading ? (
              <span className="rounded-2xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-900">
                กำลังโหลดข้อมูลวิเคราะห์...
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => void refreshExecutiveDashboard()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              รีเฟรชข้อมูล
            </button>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              โหมดดูอย่างเดียว
            </div>
          </div>
        </div>
      </header>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">ข้อมูลส่วนตัว</h2>
        <p className="text-sm text-slate-600">ดูโปรไฟล์สั้น ๆ — อัปโหลดรูปได้ที่หน้าโปรไฟล์</p>
        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-4 border-white shadow-md ring-2 ring-indigo-200">
              {user?.profileImage ? (
                <Image
                  src={user.profileImage}
                  alt="รูปโปรไฟล์ผู้บริหาร"
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-200 to-sky-200 text-sm font-bold text-slate-700">
                  {initials}
                </div>
              )}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{user?.name ?? "ผู้บริหาร"}</p>
              <p className="text-sm text-slate-600">{user?.department ?? "หน่วยงานผู้บริหาร"}</p>
            </div>
          </div>
          <Link
            href="/dashboard/executive/profile"
            className="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700"
          >
            จัดการรูปโปรไฟล์
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-900">วิเคราะห์ช่องว่างทักษะ</h2>
          <p className="text-sm text-slate-600">ค่าที่สูงหมายถึงความจำเป็นต้องพัฒนามากขึ้น</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillGaps} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="skill"
                  tick={{ fontSize: 10, fill: "#64748b" }}
                  interval={0}
                  angle={-12}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0)} คะแนนช่องว่าง`, "ช่องว่าง"]}
                  contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }}
                />
                <Bar dataKey="gap" radius={[12, 12, 0, 0]} fill="url(#gapGradient)">
                  {skillGaps.map((_, i) => (
                    <Cell key={i} fillOpacity={0.85} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
          <h2 className="text-lg font-bold text-slate-900">แนวโน้มการอบรม</h2>
          <p className="text-sm text-slate-600">ความต้องการหลักสูตรจากครูในเครือข่าย (จำนวนคำขอ)</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trainingTrends} layout="vertical" margin={{ left: 8, right: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="category"
                  width={120}
                  tick={{ fontSize: 10, fill: "#64748b" }}
                />
                <Tooltip
                  formatter={(v) => [`${Number(v ?? 0)} คำขอ`, "จำนวน"]}
                  contentStyle={{ borderRadius: 16 }}
                />
                <Bar dataKey="count" radius={[0, 12, 12, 0]}>
                  {trainingTrends.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">สรุปข้อมูลหลักสูตรและการอบรม</h2>
        <p className="text-sm text-slate-600">
          แสดงจำนวนหลักสูตรที่มีและจำนวนครูที่ผ่านการอบรมแยกตามหมวดหมู่
        </p>

        <div className="mt-4 h-72 rounded-[24px] border border-white/60 bg-white/60 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseOverviewRows} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 10, fill: "#64748b" }}
                interval={0}
                angle={-12}
                textAnchor="end"
                height={64}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(value) => [`${Number(value ?? 0)} คน`, "ครูที่ผ่านการอบรม"]}
                contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }}
              />
              <Bar dataKey="trainedTeachers" radius={[12, 12, 0, 0]}>
                {courseOverviewRows.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[24px] border border-white/60 bg-white/60 p-3">
          <table className="w-full min-w-[620px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-500">
                <th className="px-4 py-2">หมวดหมู่</th>
                <th className="px-4 py-2">จำนวนหลักสูตรที่มี</th>
                <th className="px-4 py-2">จำนวนครูที่ผ่านการอบรม</th>
              </tr>
            </thead>
            <tbody>
              {courseOverviewRows.map((row) => (
                <tr
                  key={row.category}
                  className="cursor-pointer rounded-2xl bg-white/80 shadow-sm transition hover:bg-orange-50"
                  onClick={() => setSelectedCategory(row.category)}
                >
                  <td className="rounded-l-2xl px-4 py-3 font-semibold text-slate-800">{row.category}</td>
                  <td className="px-4 py-3 text-slate-700">{row.availableCourses} หลักสูตร</td>
                  <td className="rounded-r-2xl px-4 py-3 text-slate-700">{row.trainedTeachers} คน</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">สรุปพอร์ตโฟลิโอตามระดับกิจกรรม</h2>
        <p className="text-sm text-slate-600">
          จำนวนกิจกรรมที่บันทึกในระบบ จัดกลุ่มตามระดับ: ตนเอง, ชุมชน, สถานศึกษา, จังหวัด, ชาติ, นานาชาติ
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <th className="rounded-l-2xl bg-slate-100 px-4 py-3">ระดับกิจกรรม</th>
                <th className="bg-slate-100 px-4 py-3">จำนวนกิจกรรมที่บันทึก</th>
                <th className="rounded-r-2xl bg-slate-100 px-4 py-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {portfolioByLevel.map((row) => (
                <tr
                  key={row.level}
                  className={`border-b border-slate-100 last:border-0 ${
                    row.level === "ชาติ" || row.level === "นานาชาติ"
                      ? "cursor-pointer transition hover:bg-pink-50"
                      : ""
                  }`}
                  onClick={() => {
                    if (row.level === "ชาติ" || row.level === "นานาชาติ") {
                      setSelectedPortfolioLevel(row.level);
                    }
                  }}
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">{row.level}</td>
                  <td className="px-4 py-3 text-slate-700">{row.count}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.level === "ชาติ" || row.level === "นานาชาติ"
                      ? "เน้นคุณภาพและการเผยแพร่ต้นแบบ"
                      : "กิจกรรมพื้นฐานในพื้นที่ใกล้เคียง"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">การวิเคราะห์ภาระงานและภาวะหมดไฟ</h2>
            <p className="text-sm text-slate-600">
              Workload &amp; Burnout Analytics — แผนภูมิกระจายภาระงานรวมเทียบกับคะแนนการมีส่วนร่วมของครู
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-800 ring-1 ring-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              โซนปลอดภัย
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-amber-900 ring-1 ring-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              เฝ้าระวัง
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1.5 text-rose-800 ring-1 ring-rose-200">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              ความเสี่ยงสูง
            </span>
          </div>
        </div>

        <div className="mt-5 h-80 rounded-[24px] border border-white/60 bg-white/60 p-2">
          {workloadRows.length === 0 && executiveDashboardLoading ? (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-600">
              กำลังโหลดแผนภูมิ...
            </div>
          ) : null}
          {workloadRows.length === 0 && !executiveDashboardLoading ? (
            <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-600">
              ยังไม่มีข้อมูลครู (role = teacher) หรือ workload_hours ในระบบ
            </div>
          ) : null}
          {workloadRows.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 12, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                type="number"
                dataKey="workload"
                name="ภาระงานรวม"
                unit=" ชม./สัปดาห์"
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{ value: "ภาระงานรวม (ชั่วโมงสอน + งานสนับสนุน)", position: "insideBottom", offset: -2, fill: "#64748b", fontSize: 11 }}
              />
              <YAxis
                type="number"
                dataKey="engagement"
                name="การมีส่วนร่วม"
                unit="%"
                tick={{ fontSize: 11, fill: "#64748b" }}
                label={{ value: "คะแนนการมีส่วนร่วม", angle: -90, position: "insideLeft", fill: "#64748b", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: "4 4" }}
                formatter={(value, name) => {
                  if (name === "ภาระงานรวม") return [`${Number(value ?? 0)} ชม./สัปดาห์`, name];
                  if (name === "การมีส่วนร่วม") return [`${Number(value ?? 0)}%`, name];
                  return [String(value ?? ""), String(name ?? "")];
                }}
                labelFormatter={(_, payload) => {
                  const p = payload?.[0]?.payload as { dept?: string } | undefined;
                  return p?.dept ? `แผนกวิชา: ${p.dept}` : "";
                }}
                contentStyle={{ borderRadius: 16, borderColor: "#e2e8f0" }}
              />
              <Scatter
                name="แผนกวิชา"
                data={workloadChartPoints}
                fill="#8884d8"
                shape={(props) => {
                  const { cx, cy, payload } = props as {
                    cx?: number;
                    cy?: number;
                    payload?: { risk?: "low" | "medium" | "high" };
                  };
                  if (cx == null || cy == null) return null;
                  const fill = riskDotFill(payload?.risk ?? "medium");
                  return (
                    <circle cx={cx} cy={cy} r={9} fill={fill} fillOpacity={0.92} stroke="#ffffff" strokeWidth={2} />
                  );
                }}
              />
            </ScatterChart>
          </ResponsiveContainer>
          ) : null}
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-600">
          แกน X = ภาระงานรวมจาก workload_hours (จัดกลุ่มตามแผนกวิชา) · แกน Y = goal_achievement_percent จากโปรไฟล์ครู
        </p>

        <div className="mt-6 overflow-x-auto rounded-[24px] border border-white/60 bg-white/60 p-3">
          <table className="w-full min-w-[720px] border-separate border-spacing-y-2 text-sm">
            <thead>
              <tr className="text-left text-xs font-bold text-slate-500">
                <th className="px-4 py-2">แผนกวิชา</th>
                <th className="px-4 py-2">ชั่วโมงสอน</th>
                <th className="px-4 py-2">งานสนับสนุนเพิ่มเติม</th>
                <th className="px-4 py-2">การมีส่วนร่วม</th>
                <th className="px-4 py-2">ระดับความเสี่ยง</th>
              </tr>
            </thead>
            <tbody>
              {workloadRows.map((row) => (
                <tr key={row.id} className="rounded-2xl bg-white/90 shadow-sm">
                  <td className="rounded-l-2xl px-4 py-3 font-semibold text-slate-900">{row.dept}</td>
                  <td className="px-4 py-3 text-slate-800">{row.teachingHours} ชม.</td>
                  <td className="px-4 py-3 text-slate-800">{row.additionalTasksHours} ชม.</td>
                  <td className="px-4 py-3 text-slate-800">{row.engagementScore}%</td>
                  <td className="rounded-r-2xl px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${riskBadgeClasses(row.riskLevel)}`}
                    >
                      {riskLabelTh(row.riskLevel)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex gap-4 rounded-[24px] border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 to-white/80 p-5 shadow-inner">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] bg-indigo-600 text-white shadow-md">
            <Sparkles className="h-6 w-6" aria-hidden />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-indigo-700">AI Recommendation</p>
            <p className="mt-1 text-sm font-semibold leading-relaxed text-slate-900">{aiInsightText}</p>
          </div>
        </div>
      </section>

      {selectedCategory ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm transition">
          <div className="w-full max-w-3xl rounded-[24px] border border-white/60 bg-white/90 p-6 shadow-2xl transition-all">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">รายละเอียดหลักสูตรหมวดหมู่: {selectedCategory}</h3>
                <p className="text-sm text-slate-600">รายการหลักสูตรและจำนวนครูที่จบหลักสูตร</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                ปิด
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-100 text-left text-xs font-bold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">ชื่อหลักสูตร</th>
                    <th className="px-4 py-3">แหล่งที่มา</th>
                    <th className="px-4 py-3">จำนวนครูที่จบหลักสูตร</th>
                  </tr>
                </thead>
                <tbody>
                  {(courseDetailsByCategory[selectedCategory] ?? []).length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">
                        ยังไม่มีรายละเอียดเป้าหมายในหมวดนี้ในฐานข้อมูล
                      </td>
                    </tr>
                  ) : (
                    (courseDetailsByCategory[selectedCategory] ?? []).map((course) => (
                      <tr key={`${course.name}-${course.source}`} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold text-slate-800">{course.name}</td>
                        <td className="px-4 py-3 text-slate-700">{course.source}</td>
                        <td className="px-4 py-3 text-slate-700">{course.completions} คน</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {selectedPortfolioLevel ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm transition">
          <div className="w-full max-w-2xl rounded-[24px] border border-white/60 bg-white/90 p-6 shadow-2xl transition-all">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  รายละเอียดผลงานระดับ{selectedPortfolioLevel}
                </h3>
                <p className="text-sm text-slate-600">แสดงเฉพาะกิจกรรมระดับสูงที่เผยแพร่เชิงต้นแบบ</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPortfolioLevel(null)}
                className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                ปิด
              </button>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full min-w-[500px] text-sm">
                <thead className="bg-slate-100 text-left text-xs font-bold text-slate-600">
                  <tr>
                    <th className="px-4 py-3">ชื่อกิจกรรม/ผลงาน</th>
                    <th className="px-4 py-3">ชื่อครูผู้ทำกิจกรรม</th>
                  </tr>
                </thead>
                <tbody>
                  {(selectedPortfolioLevel === "ชาติ"
                    ? nationalPortfolioDetails
                    : internationalPortfolioDetails
                  ).length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-6 text-center text-sm text-slate-500">
                        ยังไม่มีกิจกรรมระดับนี้ในระบบ
                      </td>
                    </tr>
                  ) : (
                    (selectedPortfolioLevel === "ชาติ"
                      ? nationalPortfolioDetails
                      : internationalPortfolioDetails
                    ).map((item) => (
                      <tr key={`${item.activityName}-${item.teacherName}`} className="border-t border-slate-100">
                        <td className="px-4 py-3 font-semibold text-slate-800">{item.activityName}</td>
                        <td className="px-4 py-3 text-slate-700">{item.teacherName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
