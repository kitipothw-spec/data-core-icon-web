import type { SupabaseClient } from "@supabase/supabase-js";
import type { TeachingResource } from "@/lib/app-data-types";

type ResourceRow = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  likes_count: number | null;
  created_at: string;
};

export async function fetchTeachingResources(
  supabase: SupabaseClient,
  currentUserId: string,
): Promise<TeachingResource[]> {
  const { data: rows, error } = await supabase
    .from("resources")
    .select("id, title, category, file_url, likes_count, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: likeRows } = await supabase.from("resource_likes").select("resource_id").eq("user_id", currentUserId);
  const liked = new Set((likeRows ?? []).map((r) => r.resource_id as string));

  return ((rows ?? []) as ResourceRow[]).map((r) => ({
    id: r.id,
    title: r.title,
    category: r.category,
    imageUrl: r.file_url || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80",
    likes: r.likes_count ?? 0,
    likedByMe: liked.has(r.id),
    createdAt: typeof r.created_at === "string" ? r.created_at.slice(0, 10) : "",
  }));
}

export async function insertTeachingResourceRow(
  supabase: SupabaseClient,
  input: { title: string; category: string; imageUrl: string },
) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error(authErr?.message ?? "ไม่พบผู้ใช้");

  const { error } = await supabase.from("resources").insert({
    creator_id: user.id,
    title: input.title,
    category: input.category,
    file_url: input.imageUrl,
  });
  if (error) throw error;
}

export async function toggleResourceLikeRow(supabase: SupabaseClient, resourceId: string, currentlyLiked: boolean) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user) throw new Error(authErr?.message ?? "ไม่พบผู้ใช้");

  if (currentlyLiked) {
    const { error } = await supabase
      .from("resource_likes")
      .delete()
      .eq("resource_id", resourceId)
      .eq("user_id", user.id);
    if (error) throw error;
  } else {
    const { error } = await supabase.from("resource_likes").insert({ resource_id: resourceId, user_id: user.id });
    if (error) throw error;
  }
}
