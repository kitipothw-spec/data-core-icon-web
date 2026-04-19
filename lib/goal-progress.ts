import type { PortfolioItem, TeacherGoal } from "@/lib/teacher-storage";

export type GoalProgressRow = {
  id: string;
  goal: string;
  description: string;
  linkedCount: number;
  totalPercent: number;
};

export function computeGoalProgressList(
  goals: TeacherGoal[],
  portfolioItems: PortfolioItem[],
): GoalProgressRow[] {
  if (goals.length === 0) return [];
  return goals.map((goal) => {
    const linkedCount = portfolioItems.filter(
      (item) => item.relatedGoal === goal.id || item.relatedGoal === goal.category,
    ).length;
    const fromSql =
      goal.progressPercent !== undefined && goal.progressPercent !== null
        ? Math.min(100, goal.progressPercent)
        : null;
    return {
      id: goal.id,
      goal: goal.category,
      description: goal.description,
      linkedCount,
      totalPercent: fromSql !== null ? fromSql : Math.min(100, linkedCount * 25),
    };
  });
}
