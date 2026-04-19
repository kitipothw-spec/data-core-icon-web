import type { SupabaseClient } from "@supabase/supabase-js";
import type { PortfolioItem, TeacherGoal, TeacherProfileState } from "@/lib/teacher-storage";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  department: string | null;
  academic_year_goals: string | null;
  goal_achievement_percent: number | null;
};

type GoalRow = {
  id: string;
  user_id: string;
  category: string;
  description: string;
  created_at: string;
};

type ActivityRow = {
  id: string;
  user_id: string;
  goal_id: string | null;
  title: string;
  category: string;
  level: string;
  activity_date: string;
  evidence_url: string | null;
  contribution_percent: number;
};

function mapProfileRowToState(row: ProfileRow, goals: TeacherGoal[]): TeacherProfileState {
  return {
    displayName: row.full_name ?? "",
    department: row.department ?? "",
    academicYearGoals: row.academic_year_goals ?? "",
    goalAchievementPercent:
      typeof row.goal_achievement_percent === "number" ? row.goal_achievement_percent : 0,
    goalCategories: [],
    goals,
  };
}

function mapActivityRow(item: ActivityRow): PortfolioItem {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    level: item.level,
    date: item.activity_date,
    relatedGoal: item.goal_id ?? "",
    goalContributionPercent: item.contribution_percent,
  };
}

/** เทียบเท่า SQL: least(100, count(activities per goal) * 25) */
function goalsWithProgressFromRows(goals: GoalRow[], activities: ActivityRow[]): TeacherGoal[] {
  const counts = new Map<string, number>();
  for (const a of activities) {
    if (!a.goal_id) continue;
    counts.set(a.goal_id, (counts.get(a.goal_id) ?? 0) + 1);
  }
  return goals.map((g) => ({
    id: g.id,
    category: g.category,
    description: g.description,
    progressPercent: Math.min(100, (counts.get(g.id) ?? 0) * 25),
  }));
}

export async function fetchTeacherProfileBundle(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ profile: TeacherProfileState; activities: PortfolioItem[] }> {
  const [{ data: profileRow, error: profileError }, { data: goalRows, error: goalsError }, { data: actRows, error: actError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("goals").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase
        .from("activities")
        .select("*")
        .eq("user_id", userId)
        .order("activity_date", { ascending: false }),
    ]);

  if (profileError) throw profileError;
  if (goalsError) throw goalsError;
  if (actError) throw actError;

  const pr = profileRow as ProfileRow | null;
  const actList = (actRows ?? []) as ActivityRow[];
  const goals = goalsWithProgressFromRows((goalRows ?? []) as GoalRow[], actList);

  const profile = mapProfileRowToState(
    pr ?? {
      id: userId,
      email: null,
      full_name: "",
      department: "",
      academic_year_goals: "",
      goal_achievement_percent: 0,
    },
    goals,
  );

  const activities = actList.map(mapActivityRow);
  return { profile, activities };
}

export async function updateTeacherProfileMeta(
  supabase: SupabaseClient,
  userId: string,
  meta: Pick<TeacherProfileState, "displayName" | "department" | "academicYearGoals" | "goalAchievementPercent">,
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: meta.displayName,
      department: meta.department,
      academic_year_goals: meta.academicYearGoals,
      goal_achievement_percent: meta.goalAchievementPercent,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
}

/** สร้างแถว profiles ถ้ายังไม่มี (FK จาก auth.users อยู่แล้ว — แถวนี้ใช้ RLS และ UI) */
export async function ensureProfileRow(
  supabase: SupabaseClient,
  userId: string,
  email: string | null,
  role: "teacher" | "executive" | "admin" = "teacher",
) {
  const { data: existing, error: selErr } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
  if (selErr) throw selErr;
  if (existing) return;

  const { error } = await supabase.from("profiles").insert({
    id: userId,
    email,
    full_name: email?.split("@")[0] ?? "ผู้ใช้",
    role,
    department: "",
  });
  if (error) throw error;
}

export async function insertTeacherGoal(
  supabase: SupabaseClient,
  userId: string,
  category: string,
  description: string,
) {
  const { error } = await supabase.from("goals").insert({
    user_id: userId,
    category,
    description,
  });
  if (error) throw error;
}

/**
 * ใช้ supabase.auth.getUser() เป็นหลัก แล้วตรวจสอบ/สร้าง profile ก่อน insert เป้าหมาย
 */
export async function insertTeacherGoalWithAuthSession(
  supabase: SupabaseClient,
  category: string,
  description: string,
) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr) throw new Error(`Auth: ${authErr.message}`);
  if (!user?.id) throw new Error("ไม่พบ UUID ผู้ใช้ — กรุณาเข้าสู่ระบบใหม่");

  await ensureProfileRow(supabase, user.id, user.email ?? null, "teacher");
  await insertTeacherGoal(supabase, user.id, category, description);
}

export async function deleteTeacherGoal(supabase: SupabaseClient, userId: string, goalId: string) {
  const { error } = await supabase.from("goals").delete().eq("id", goalId).eq("user_id", userId);
  if (error) throw error;
}

export async function insertActivity(
  supabase: SupabaseClient,
  userId: string,
  item: Omit<PortfolioItem, "id">,
) {
  const goalId = item.relatedGoal?.trim() ? item.relatedGoal : null;
  const { error } = await supabase.from("activities").insert({
    user_id: userId,
    goal_id: goalId,
    title: item.title,
    category: item.category,
    level: item.level,
    activity_date: item.date,
    evidence_url: null,
    contribution_percent: item.goalContributionPercent,
  });
  if (error) throw error;
}

export async function updateActivity(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  item: Omit<PortfolioItem, "id">,
) {
  const goalId = item.relatedGoal?.trim() ? item.relatedGoal : null;
  const { error } = await supabase
    .from("activities")
    .update({
      goal_id: goalId,
      title: item.title,
      category: item.category,
      level: item.level,
      activity_date: item.date,
      contribution_percent: item.goalContributionPercent,
    })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function deleteActivity(supabase: SupabaseClient, userId: string, id: string) {
  const { error } = await supabase.from("activities").delete().eq("id", id).eq("user_id", userId);
  if (error) throw error;
}

export async function updateProfileAvatarUrl(
  supabase: SupabaseClient,
  userId: string,
  avatarUrl: string | null,
) {
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() }).eq("id", userId);
  if (error) throw error;
}
