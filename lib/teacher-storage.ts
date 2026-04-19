export type TeacherGoal = {
  id: string;
  category: string;
  description: string;
  /** จากการคำนวณความคืบหน้าใน client หลังโหลด goals + activities จาก Supabase */
  progressPercent?: number | null;
};

export type PortfolioItem = {
  id: string;
  title: string;
  category: string;
  level: string;
  date: string;
  relatedGoal: string;
  goalContributionPercent: number;
};

const PORTFOLIO_KEY = "data-core-icon-teacher-portfolio";
const PROFILE_KEY = "data-core-icon-teacher-profile";

export type TeacherProfileState = {
  displayName: string;
  department: string;
  academicYearGoals: string;
  goalAchievementPercent: number;
  goalCategories: string[];
  goals: TeacherGoal[];
};

export const defaultProfile = (): TeacherProfileState => ({
  displayName: "",
  department: "",
  academicYearGoals: "",
  goalAchievementPercent: 0,
  goalCategories: [],
  goals: [],
});

export function loadTeacherProfile(): TeacherProfileState {
  if (typeof window === "undefined") return defaultProfile();
  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return defaultProfile();
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return defaultProfile();
    const o = data as Record<string, unknown>;
    return {
      displayName: typeof o.displayName === "string" ? o.displayName : "",
      department: typeof o.department === "string" ? o.department : "",
      academicYearGoals:
        typeof o.academicYearGoals === "string" ? o.academicYearGoals : "",
      goalAchievementPercent:
        typeof o.goalAchievementPercent === "number" &&
        o.goalAchievementPercent >= 0 &&
        o.goalAchievementPercent <= 100
          ? o.goalAchievementPercent
          : 0,
      goalCategories: Array.isArray(o.goalCategories)
        ? o.goalCategories.filter((x): x is string => typeof x === "string")
        : [],
      goals: Array.isArray(o.goals)
        ? o.goals
            .filter(
              (goal): goal is TeacherGoal =>
                typeof goal === "object" &&
                goal !== null &&
                typeof (goal as TeacherGoal).id === "string" &&
                typeof (goal as TeacherGoal).category === "string" &&
                typeof (goal as TeacherGoal).description === "string",
            )
            .map((goal) => ({
              id: goal.id,
              category: goal.category,
              description: goal.description,
            }))
        : [],
    };
  } catch {
    return defaultProfile();
  }
}

export function saveTeacherProfile(profile: TeacherProfileState): void {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadPortfolioItems(): PortfolioItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(PORTFOLIO_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (p): p is PortfolioItem =>
          typeof p === "object" &&
          p !== null &&
          typeof (p as PortfolioItem).id === "string" &&
          typeof (p as PortfolioItem).title === "string",
      )
      .map((item) => ({
        ...item,
        relatedGoal: typeof item.relatedGoal === "string" ? item.relatedGoal : "",
        goalContributionPercent:
          typeof item.goalContributionPercent === "number" &&
          item.goalContributionPercent >= 0 &&
          item.goalContributionPercent <= 100
            ? item.goalContributionPercent
            : 0,
      }));
  } catch {
    return [];
  }
}

export function savePortfolioItems(items: PortfolioItem[]): void {
  window.localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(items));
}

export function addPortfolioItem(item: Omit<PortfolioItem, "id">): PortfolioItem[] {
  const items = loadPortfolioItems();
  const next: PortfolioItem = {
    ...item,
    id: `pf-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  };
  const updated = [next, ...items];
  savePortfolioItems(updated);
  return updated;
}

export function updatePortfolioItem(
  id: string,
  patch: Omit<PortfolioItem, "id">,
): PortfolioItem[] {
  const items = loadPortfolioItems();
  const updated = items.map((item) => (item.id === id ? { ...patch, id } : item));
  savePortfolioItems(updated);
  return updated;
}

export function deletePortfolioItem(id: string): PortfolioItem[] {
  const items = loadPortfolioItems();
  const updated = items.filter((item) => item.id !== id);
  savePortfolioItems(updated);
  return updated;
}
