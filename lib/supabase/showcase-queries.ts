import type { SupabaseClient } from "@supabase/supabase-js";

export type ShowcaseTeacher = {
  id: string;
  name: string;
  image: string;
  topSkills: string[];
};

export type ShowcaseSub = {
  id: string;
  name: string;
  teachers: ShowcaseTeacher[];
};

export type ShowcaseCategory = {
  id: string;
  name: string;
  subCategories: ShowcaseSub[];
};

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80";

export async function fetchExecutiveShowcaseData(supabase: SupabaseClient): Promise<ShowcaseCategory[]> {
  const [{ data: goals, error: gErr }, { data: profiles, error: pErr }] = await Promise.all([
    supabase.from("goals").select("id, user_id, category, description").order("created_at", { ascending: false }),
    supabase.from("profiles").select("id, full_name, avatar_url, role").eq("role", "teacher"),
  ]);
  if (gErr) throw gErr;
  if (pErr) throw pErr;

  const profMap = new Map(
    ((profiles ?? []) as { id: string; full_name: string | null; avatar_url: string | null }[]).map((p) => [
      p.id,
      p,
    ]),
  );

  const goalsList = (goals ?? []) as { id: string; user_id: string; category: string; description: string }[];
  const byCategory = new Map<string, typeof goalsList>();
  for (const g of goalsList) {
    const cat = g.category?.trim() || "ไม่ระบุหมวด";
    const list = byCategory.get(cat) ?? [];
    list.push(g);
    byCategory.set(cat, list);
  }

  if (byCategory.size === 0) {
    return [
      {
        id: "empty",
        name: "ทั่วไป",
        subCategories: [
          {
            id: "sub-empty",
            name: "ครูในระบบ",
            teachers: [],
          },
        ],
      },
    ];
  }

  const categories: ShowcaseCategory[] = [];
  for (const [catName, list] of byCategory.entries()) {
    const userIds = [...new Set(list.map((x) => x.user_id))];
    const teachers: ShowcaseTeacher[] = userIds.map((uid) => {
      const p = profMap.get(uid);
      const userGoals = list.filter((x) => x.user_id === uid);
      const topSkills = userGoals
        .slice(0, 4)
        .map((x) => (x.description?.trim() ? x.description.slice(0, 48) : x.category))
        .filter(Boolean);
      return {
        id: uid,
        name: p?.full_name?.trim() || "ครู",
        image: p?.avatar_url?.trim() || FALLBACK_IMG,
        topSkills: topSkills.length ? topSkills : [catName],
      };
    });
    const slug = catName.replace(/\s+/g, "-").slice(0, 40);
    categories.push({
      id: slug,
      name: catName,
      subCategories: [
        {
          id: `${slug}-all`,
          name: "ครูที่มีเป้าหมายในหมวดนี้",
          teachers,
        },
      ],
    });
  }
  return categories.sort((a, b) => a.name.localeCompare(b.name, "th"));
}
