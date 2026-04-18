"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

const skillGaps = [
  { skill: "การวิเคราะห์ข้อมูล", gap: 42 },
  { skill: "สื่อดิจิทัล", gap: 55 },
  { skill: "การประเมินเชิงรูปธรรม", gap: 38 },
  { skill: "การจัดการชั้นเรียนเชิงรุก", gap: 29 },
  { skill: "การวิจัยเชิงปฏิบัติ", gap: 47 },
];

const trainingTrends = [
  { category: "STEM & คณิตศาสตร์", count: 128 },
  { category: "ภาษาอังกฤษเชิงสื่อสาร", count: 112 },
  { category: "จิตวิทยาการศึกษา", count: 96 },
  { category: "เทคโนโลยีการสอน", count: 154 },
  { category: "การวัดผลสมรรถนะ", count: 88 },
];

const COLORS = ["#fb923c", "#f472b6", "#38bdf8", "#a78bfa", "#34d399"];

const portfolioByLevel = [
  { level: "ตนเอง", count: 420 },
  { level: "ชุมชน", count: 186 },
  { level: "สถานศึกษา", count: 244 },
  { level: "จังหวัด", count: 132 },
  { level: "ชาติ", count: 61 },
  { level: "นานาชาติ", count: 18 },
];

const burnoutByDepartment = [
  { dept: "คณิตศาสตร์", workload: 83, burnoutRisk: 62 },
  { dept: "ภาษาไทย", workload: 71, burnoutRisk: 48 },
  { dept: "วิทยาศาสตร์", workload: 88, burnoutRisk: 69 },
  { dept: "อาชีวะ/เทคนิค", workload: 91, burnoutRisk: 76 },
  { dept: "ภาษาต่างประเทศ", workload: 66, burnoutRisk: 40 },
];

export function ExecutiveView() {
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
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            โหมดดูอย่างเดียว
          </div>
        </div>
      </header>

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
                <tr key={row.level} className="border-b border-slate-100 last:border-0">
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
        <h2 className="text-lg font-bold text-slate-900">
          ความเสี่ยงภาวะหมดไฟและภาระงานครู
        </h2>
        <p className="text-sm text-slate-600">
          วิเคราะห์ภาระงานและความเสี่ยงหมดไฟรายแผนก เพื่อติดตามและวางแผนสนับสนุนเชิงรุก
        </p>
        <div className="mt-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={burnoutByDepartment} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="dept" tick={{ fontSize: 11, fill: "#64748b" }} interval={0} />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                formatter={(v, name) => [
                  `${Number(v ?? 0)}%`,
                  name === "workload" ? "ระดับภาระงาน" : "ความเสี่ยงหมดไฟ",
                ]}
                contentStyle={{ borderRadius: 16 }}
              />
              <Bar dataKey="workload" name="workload" fill="#f97316" radius={[10, 10, 0, 0]} />
              <Bar dataKey="burnoutRisk" name="burnoutRisk" fill="#ec4899" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs font-semibold text-slate-600">
          สีส้ม = ภาระงานรวม · สีชมพู = ความเสี่ยงภาวะหมดไฟ
        </p>
      </section>
    </div>
  );
}
