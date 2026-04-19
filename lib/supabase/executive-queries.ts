import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExecutiveWorkloadRow } from "@/lib/app-data-types";
import { aiInsightForWorkload } from "@/lib/workload-mock";

const LEVEL_ORDER = ["ตนเอง", "ชุมชน", "สถานศึกษา", "จังหวัด", "ชาติ", "นานาชาติ"] as const;

type ProfileRow = {
  id: string;
  full_name: string | null;
  department: string | null;
  role: string | null;
  workload_hours: number | string | null;
  goal_achievement_percent: number | null;
};

type GoalRow = { id: string; user_id: string; category: string; description: string };
type ActivityRow = {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  category: string;
  level: string;
};

function num(n: number | string | null | undefined): number {
  if (n == null) return 0;
  const x = typeof n === "string" ? parseFloat(n) : n;
  return Number.isFinite(x) ? x : 0;
}

function workloadRisk(w: number, engagement: number): ExecutiveWorkloadRow["riskLevel"] {
  if (w >= 36 || engagement < 45) return "high";
  if (w >= 28 || engagement < 58) return "medium";
  return "low";
}

function buildWorkloadRows(teachers: ProfileRow[]): ExecutiveWorkloadRow[] {
  const byDept = new Map<string, ProfileRow[]>();
  for (const t of teachers) {
    const dept = (t.department?.trim() || "ไม่ระบุแผนกวิชา").slice(0, 80);
    const list = byDept.get(dept) ?? [];
    list.push(t);
    byDept.set(dept, list);
  }

  const rows: ExecutiveWorkloadRow[] = [];
  for (const [dept, group] of byDept) {
    const wAvg = group.reduce((s, t) => s + num(t.workload_hours), 0) / Math.max(1, group.length);
    const engAvg =
      group.reduce((s, t) => s + (t.goal_achievement_percent ?? 0), 0) / Math.max(1, group.length);
    const teachingHours = Math.round(wAvg * 0.58 * 10) / 10;
    const additionalTasksHours = Math.max(0, Math.round((wAvg - teachingHours) * 10) / 10);
    const engagementScore = Math.round(Math.min(100, Math.max(0, engAvg)));
    const id = `dept-${dept.replace(/\s+/g, "-").slice(0, 40)}`;
    rows.push({
      id,
      dept,
      teachingHours: Math.round(teachingHours) || Math.round(wAvg * 0.6),
      additionalTasksHours: Math.round(additionalTasksHours) || Math.max(0, Math.round(wAvg * 0.4)),
      engagementScore,
      riskLevel: workloadRisk(wAvg, engagementScore),
    });
  }
  return rows.sort((a, b) => workloadTotal(b) - workloadTotal(a));
}

function workloadTotal(r: ExecutiveWorkloadRow): number {
  return r.teachingHours + r.additionalTasksHours;
}

export type ExecutiveDashboardData = {
  skillGaps: { skill: string; gap: number }[];
  trainingTrends: { category: string; count: number }[];
  courseOverviewRows: { category: string; availableCourses: number; trainedTeachers: number }[];
  portfolioByLevel: { level: string; count: number }[];
  executiveWorkload: ExecutiveWorkloadRow[];
  courseDetailsByCategory: Record<string, { name: string; source: string; completions: number }[]>;
  nationalPortfolioDetails: { activityName: string; teacherName: string }[];
  internationalPortfolioDetails: { activityName: string; teacherName: string }[];
  aiInsightText: string;
};

export async function fetchExecutiveDashboardData(supabase: SupabaseClient): Promise<ExecutiveDashboardData> {
  const [{ data: profiles, error: profErr }, { data: goals, error: gErr }, { data: activities, error: aErr }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, department, role, workload_hours, goal_achievement_percent"),
      supabase.from("goals").select("id, user_id, category, description"),
      supabase.from("activities").select("id, user_id, goal_id, title, category, level"),
    ]);

  if (profErr) throw profErr;
  if (gErr) throw gErr;
  if (aErr) throw aErr;

  const teacherProfiles = ((profiles ?? []) as ProfileRow[]).filter((p) => p.role === "teacher");
  const goalRows = (goals ?? []) as GoalRow[];
  const activityRows = (activities ?? []) as ActivityRow[];

  const nameByUser = new Map<string, string>();
  for (const p of teacherProfiles) {
    nameByUser.set(p.id, p.full_name?.trim() || "ครู");
  }

  const byGoalActivityCount = new Map<string, number>();
  for (const a of activityRows) {
    if (a.goal_id) {
      byGoalActivityCount.set(a.goal_id, (byGoalActivityCount.get(a.goal_id) ?? 0) + 1);
    }
  }

  const catAgg = new Map<string, { sum: number; n: number }>();
  for (const g of goalRows) {
    const prog = Math.min(100, (byGoalActivityCount.get(g.id) ?? 0) * 25);
    const cur = catAgg.get(g.category) ?? { sum: 0, n: 0 };
    cur.sum += prog;
    cur.n += 1;
    catAgg.set(g.category, cur);
  }
  const skillGaps = [...catAgg.entries()]
    .map(([skill, { sum, n }]) => ({
      skill,
      gap: Math.min(100, Math.max(0, Math.round(100 - sum / Math.max(1, n)))),
    }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 8);

  const trainMap = new Map<string, number>();
  for (const a of activityRows) {
    const c = a.category?.trim() || "ไม่ระบุหมวด";
    trainMap.set(c, (trainMap.get(c) ?? 0) + 1);
  }
  const trainingTrends = [...trainMap.entries()]
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const goalCatMap = new Map<string, { goals: number; users: Set<string> }>();
  for (const g of goalRows) {
    const cur = goalCatMap.get(g.category) ?? { goals: 0, users: new Set<string>() };
    cur.goals += 1;
    cur.users.add(g.user_id);
    goalCatMap.set(g.category, cur);
  }
  const courseOverviewRows = [...goalCatMap.entries()].map(([category, v]) => ({
    category,
    availableCourses: v.goals,
    trainedTeachers: v.users.size,
  }));

  const levelCounts = new Map<string, number>();
  for (const l of LEVEL_ORDER) levelCounts.set(l, 0);
  for (const a of activityRows) {
    const key = LEVEL_ORDER.includes(a.level as (typeof LEVEL_ORDER)[number]) ? a.level : "อื่น ๆ";
    levelCounts.set(key, (levelCounts.get(key) ?? 0) + 1);
  }
  const portfolioByLevel = [...LEVEL_ORDER, "อื่น ๆ"].map((level) => ({
    level,
    count: levelCounts.get(level) ?? 0,
  }));

  const executiveWorkload = buildWorkloadRows(teacherProfiles);

  const detailsByCat: Record<string, { name: string; source: string; completions: number }[]> = {};
  for (const g of goalRows) {
    const list = detailsByCat[g.category] ?? [];
    const cnt = byGoalActivityCount.get(g.id) ?? 0;
    list.push({
      name: g.description?.trim() || g.category,
      source: "DATA-CORE-ICON",
      completions: Math.max(1, cnt || 1),
    });
    detailsByCat[g.category] = list;
  }

  const nationalPortfolioDetails: { activityName: string; teacherName: string }[] = [];
  const internationalPortfolioDetails: { activityName: string; teacherName: string }[] = [];
  for (const a of activityRows) {
    const name = nameByUser.get(a.user_id) ?? "ครู";
    if (a.level === "ชาติ") {
      nationalPortfolioDetails.push({ activityName: a.title, teacherName: name });
    } else if (a.level === "นานาชาติ") {
      internationalPortfolioDetails.push({ activityName: a.title, teacherName: name });
    }
  }

  const aiInsightText = aiInsightForWorkload(executiveWorkload);

  return {
    skillGaps: skillGaps.length ? skillGaps : [{ skill: "ยังไม่มีข้อมูลเป้าหมาย", gap: 0 }],
    trainingTrends: trainingTrends.length ? trainingTrends : [{ category: "ยังไม่มีกิจกรรม", count: 0 }],
    courseOverviewRows: courseOverviewRows.length
      ? courseOverviewRows
      : [{ category: "ยังไม่มีหมวดเป้าหมาย", availableCourses: 0, trainedTeachers: 0 }],
    portfolioByLevel,
    executiveWorkload,
    courseDetailsByCategory: detailsByCat,
    nationalPortfolioDetails,
    internationalPortfolioDetails,
    aiInsightText,
  };
}
