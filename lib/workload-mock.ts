import type { ExecutiveWorkloadRow } from "@/lib/app-data-types";

/** Mock ข้อมูลภาระงานและการมีส่วนร่วมรายแผนก — พร้อมต่อการเชื่อมฐานข้อมูลจริง */
export const DEFAULT_EXECUTIVE_WORKLOAD: ExecutiveWorkloadRow[] = [
  {
    id: "wl-1",
    dept: "คณิตศาสตร์",
    teachingHours: 20,
    additionalTasksHours: 14,
    engagementScore: 58,
    riskLevel: "medium",
  },
  {
    id: "wl-2",
    dept: "ภาษาไทย",
    teachingHours: 18,
    additionalTasksHours: 10,
    engagementScore: 72,
    riskLevel: "low",
  },
  {
    id: "wl-3",
    dept: "วิทยาศาสตร์",
    teachingHours: 22,
    additionalTasksHours: 16,
    engagementScore: 52,
    riskLevel: "high",
  },
  {
    id: "wl-4",
    dept: "อาชีวะ/เทคนิค",
    teachingHours: 24,
    additionalTasksHours: 18,
    engagementScore: 48,
    riskLevel: "high",
  },
  {
    id: "wl-5",
    dept: "ภาษาต่างประเทศ",
    teachingHours: 17,
    additionalTasksHours: 9,
    engagementScore: 68,
    riskLevel: "low",
  },
  {
    id: "wl-6",
    dept: "สังคมศึกษา",
    teachingHours: 19,
    additionalTasksHours: 15,
    engagementScore: 61,
    riskLevel: "medium",
  },
];

export function workloadTotalHours(row: ExecutiveWorkloadRow): number {
  return row.teachingHours + row.additionalTasksHours;
}

export function aiInsightForWorkload(rows: ExecutiveWorkloadRow[]): string {
  if (rows.length === 0) {
    return "ยังไม่มีข้อมูลสำหรับวิเคราะห์ — เชื่อมระบบ HR/ตารางสอนจริงเมื่อพร้อม";
  }
  const worst = [...rows].sort(
    (a, b) => workloadTotalHours(b) - workloadTotalHours(a),
  )[0];
  if (worst.riskLevel === "high") {
    return `แผนกวิชา${worst.dept} มีภาระงานสูงเกินเกณฑ์ (${workloadTotalHours(worst)} ชม./สัปดาห์) และคะแนนการมีส่วนร่วมต่ำ ควรพิจารณาลดภาระงานสนับสนุนและจัดเวลาพัฒนาวิชาชีพ`;
  }
  if (worst.riskLevel === "medium") {
    return `แผนกวิชา${worst.dept} อยู่ในโซนเฝ้าระวัง — แนะนำติดตามตารางงานเสริมและมอบหมายงานกลุ่มให้สมดุล`;
  }
  return "ภาพรวมอยู่ในเกณฑ์ปลอดภัย — รักษาระบบสนับสนุนและช่องทางรับฟังครูอย่างสม่ำเสมอ";
}
