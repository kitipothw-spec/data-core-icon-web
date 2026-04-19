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

type GoalProgressRpc = {
  goal_id: string;
  category: string;
  description: string;
  created_at: string;
  progress_percent: number;
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

export async function fetchTeacherProfileBundle(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ profile: TeacherProfileState; activities: PortfolioItem[] }> {
  const [{ data: profileRow, error: profileError }, { data: goalsRpc, error: goalsError }, { data: actRows, error: actError }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.rpc("get_goals_with_progress", { p_user_id: userId }),
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
  const goals: TeacherGoal[] = ((goalsRpc ?? []) as GoalProgressRpc[]).map((g) => ({
    id: g.goal_id,
    category: g.category,
    description: g.description,
    progressPercent: g.progress_percent,
  }));

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

  const activities = ((actRows ?? []) as ActivityRow[]).map(mapActivityRow);
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
