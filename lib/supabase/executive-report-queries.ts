import type { SupabaseClient } from "@supabase/supabase-js";

export type ExecutiveReportCharts = {
  skillGaps: { skill: string; gap: number }[];
  achievementRatios: { name: string; value: number }[];
  summaryBullets: string[];
};

type GoalRow = { id: string; user_id: string; category: string; description: string };
type ProfileRow = { id: string; role: string | null; goal_achievement_percent: number | null };

export async function fetchExecutiveReportCharts(supabase: SupabaseClient): Promise<ExecutiveReportCharts> {
  const [{ data: goals, error: gErr }, { data: activities, error: aErr }, { data: profiles, error: pErr }] =
    await Promise.all([
      supabase.from("goals").select("id, user_id, category, description"),
      supabase.from("activities").select("id, user_id, goal_id"),
      supabase.from("profiles").select("id, role, goal_achievement_percent"),
    ]);
  if (gErr) throw gErr;
  if (aErr) throw aErr;
  if (pErr) throw pErr;

  const goalRows = (goals ?? []) as GoalRow[];
  const actRows = (activities ?? []) as { goal_id: string | null }[];
  const byGoalActivityCount = new Map<string, number>();
  for (const a of actRows) {
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
  const skillGapsFinal = skillGaps.length ? skillGaps : [{ skill: "ยังไม่มีข้อมูลเป้าหมาย", gap: 0 }];

  const teachers = ((profiles ?? []) as ProfileRow[]).filter((p) => p.role === "teacher");
  let full = 0;
  let mid = 0;
  let low = 0;
  for (const t of teachers) {
    const g = t.goal_achievement_percent ?? 0;
    if (g >= 75) full += 1;
    else if (g >= 45) mid += 1;
    else low += 1;
  }
  const total = full + mid + low || 1;
  const pFull = Math.round((full / total) * 100);
  const pMid = Math.round((mid / total) * 100);
  const pLow = Math.max(0, 100 - pFull - pMid);
  const achievementRatios = [
    { name: "บรรลุเป้าพัฒนาครบถ้วน (≥75%)", value: pFull },
    { name: "ดำเนินการตามแผน (45–74%)", value: pMid },
    { name: "ต้องเร่งติดตาม (<45%)", value: pLow },
  ];

  const topGap = skillGapsFinal[0];
  const summaryBullets = [
    topGap && topGap.gap > 0
      ? `ช่องว่างทักษะด้าน "${topGap.skill}" อยู่ที่ ${topGap.gap} คะแนน — พิจารณาจัดหลักสูตรเสริม`
      : "ยังไม่มีช่องว่างทักษะจากข้อมูลเป้าหมาย",
    `ครูร้อยละ ${pFull} อยู่ในกลุ่มบรรลุเป้าพัฒนาตามเปอร์เซ็นต์ความสำเร็จในโปรไฟล์`,
    `กลุ่มต้องเร่งติดตามราว ${pLow}% — ควรติดตามรายบุคคล`,
  ];

  return { skillGaps: skillGapsFinal, achievementRatios, summaryBullets };
}
