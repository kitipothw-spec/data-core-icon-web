"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExecutiveWorkloadRow, TeachingResource } from "@/lib/app-data-types";
import { useAuth } from "@/contexts/auth-context";
import { DEFAULT_TEACHING_RESOURCES } from "@/lib/resource-defaults";
import { DEFAULT_EXECUTIVE_WORKLOAD } from "@/lib/workload-mock";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { fetchExecutiveDashboardData, type ExecutiveDashboardData } from "@/lib/supabase/executive-queries";
import {
  fetchTeachingResources,
  insertTeachingResourceRow,
  toggleResourceLikeRow,
} from "@/lib/supabase/resource-queries";
import {
  deleteActivity,
  deleteTeacherGoal,
  fetchTeacherProfileBundle,
  insertActivity,
  insertTeacherGoalWithAuthSession,
  updateActivity,
  updateTeacherProfileMeta,
} from "@/lib/supabase/teacher-queries";
import {
  addPortfolioItem as storageAddPortfolio,
  defaultProfile,
  deletePortfolioItem as storageDeletePortfolio,
  loadPortfolioItems,
  loadTeacherProfile,
  saveTeacherProfile,
  updatePortfolioItem as storageUpdatePortfolio,
  type PortfolioItem,
  type TeacherGoal,
  type TeacherProfileState,
} from "@/lib/teacher-storage";

const RESOURCES_KEY = "data-core-icon-teaching-resources";
const WORKLOAD_KEY = "data-core-icon-executive-workload";

function dbAlert(e: unknown) {
  alert("เกิดข้อผิดพลาด: " + (e instanceof Error ? e.message : String(e)));
}

function parseResources(raw: string | null): TeachingResource[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (r): r is TeachingResource =>
        typeof r === "object" &&
        r !== null &&
        typeof (r as TeachingResource).id === "string" &&
        typeof (r as TeachingResource).title === "string",
    );
  } catch {
    return null;
  }
}

function parseWorkload(raw: string | null): ExecutiveWorkloadRow[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (w): w is ExecutiveWorkloadRow =>
        typeof w === "object" &&
        w !== null &&
        typeof (w as ExecutiveWorkloadRow).id === "string" &&
        typeof (w as ExecutiveWorkloadRow).dept === "string",
    );
  } catch {
    return null;
  }
}

type AppDataContextValue = {
  dataReady: boolean;
  profile: TeacherProfileState;
  portfolioItems: PortfolioItem[];
  teachingResources: TeachingResource[];
  executiveWorkload: ExecutiveWorkloadRow[];
  /** สรุปวิเคราะห์ผู้บริหารจาก Supabase (goals / activities / profiles) */
  executiveDashboard: ExecutiveDashboardData | null;
  executiveDashboardLoading: boolean;
  refreshExecutiveDashboard: () => Promise<void>;
  usesSupabaseData: boolean;
  setProfile: (next: TeacherProfileState) => void;
  saveProfile: (next: TeacherProfileState) => Promise<void>;
  addTeacherGoal: (category: string, description: string) => Promise<void>;
  removeTeacherGoal: (goalId: string) => Promise<void>;
  addPortfolioItem: (item: Omit<PortfolioItem, "id">) => Promise<void>;
  updatePortfolioItem: (id: string, patch: Omit<PortfolioItem, "id">) => Promise<void>;
  deletePortfolioItem: (id: string) => Promise<void>;
  refreshTeacherData: () => Promise<void>;
  toggleResourceLike: (id: string, likedByMe: boolean) => Promise<void>;
  addTeachingResource: (input: Omit<TeachingResource, "id" | "likes" | "likedByMe" | "createdAt">) => Promise<void>;
};

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { user, role, authReady } = useAuth();
  const supabase = useMemo(() => (isSupabaseConfigured() ? createBrowserSupabaseClient() : null), []);

  const [dataReady, setDataReady] = useState(false);
  const [profile, setProfileState] = useState<TeacherProfileState>(defaultProfile());
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [teachingResources, setTeachingResources] = useState<TeachingResource[]>([]);
  const [executiveWorkload, setExecutiveWorkload] = useState<ExecutiveWorkloadRow[]>([]);
  const [executiveDashboard, setExecutiveDashboard] = useState<ExecutiveDashboardData | null>(null);
  const [executiveDashboardLoading, setExecutiveDashboardLoading] = useState(false);

  const usesSupabaseData = Boolean(supabase && role === "teacher");

  const reloadTeachingResources = useCallback(async (client: SupabaseClient, userId: string) => {
    try {
      const list = await fetchTeachingResources(client, userId);
      setTeachingResources(list);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const initResourcesAndWorkload = useCallback(() => {
    const useSupabaseResources = Boolean(supabase && role === "teacher");
    if (!useSupabaseResources) {
      const rawRes = typeof window !== "undefined" ? window.localStorage.getItem(RESOURCES_KEY) : null;
      const parsedRes = parseResources(rawRes);
      if (parsedRes && parsedRes.length > 0) {
        setTeachingResources(parsedRes);
      } else {
        setTeachingResources(DEFAULT_TEACHING_RESOURCES);
        window.localStorage.setItem(RESOURCES_KEY, JSON.stringify(DEFAULT_TEACHING_RESOURCES));
      }
    }

    const useLocalWorkload = !(supabase && role === "executive");
    if (!useLocalWorkload) return;

    const rawWl = typeof window !== "undefined" ? window.localStorage.getItem(WORKLOAD_KEY) : null;
    const parsedWl = parseWorkload(rawWl);
    if (parsedWl && parsedWl.length > 0) {
      setExecutiveWorkload(parsedWl);
    } else {
      setExecutiveWorkload(DEFAULT_EXECUTIVE_WORKLOAD);
      window.localStorage.setItem(WORKLOAD_KEY, JSON.stringify(DEFAULT_EXECUTIVE_WORKLOAD));
    }
  }, [supabase, role]);

  const hydrateLocalTeacher = useCallback(() => {
    setProfileState(loadTeacherProfile());
    setPortfolioItems(loadPortfolioItems());
  }, []);

  const refreshTeacherData = useCallback(async () => {
    if (!authReady) return;
    if (supabase && role === "teacher") {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        if (!authUser?.id) {
          hydrateLocalTeacher();
          return;
        }
        const bundle = await fetchTeacherProfileBundle(supabase, authUser.id);
        setProfileState(bundle.profile);
        setPortfolioItems(bundle.activities);
        await reloadTeachingResources(supabase, authUser.id);
      } catch (e) {
        dbAlert(e);
        hydrateLocalTeacher();
      }
      return;
    }
    hydrateLocalTeacher();
  }, [authReady, supabase, role, hydrateLocalTeacher, reloadTeachingResources]);

  useEffect(() => {
    if (!authReady) return;
    initResourcesAndWorkload();
  }, [authReady, initResourcesAndWorkload]);

  const refreshExecutiveDashboard = useCallback(async () => {
    if (!supabase) return;
    setExecutiveDashboardLoading(true);
    try {
      const data = await fetchExecutiveDashboardData(supabase);
      setExecutiveDashboard(data);
      setExecutiveWorkload(data.executiveWorkload);
    } catch (e) {
      console.error(e);
      dbAlert(e);
    } finally {
      setExecutiveDashboardLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (!authReady || !supabase || role !== "executive") {
      if (role !== "executive") {
        setExecutiveDashboard(null);
      }
      return;
    }
    void refreshExecutiveDashboard();
  }, [authReady, supabase, role, refreshExecutiveDashboard]);

  useEffect(() => {
    if (!authReady) return;
    let cancelled = false;

    async function loadTeacher() {
      if (supabase && role === "teacher") {
        setDataReady(false);
        try {
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (!authUser?.id) {
            if (!cancelled) hydrateLocalTeacher();
            return;
          }
          const bundle = await fetchTeacherProfileBundle(supabase, authUser.id);
          if (!cancelled) {
            setProfileState(bundle.profile);
            setPortfolioItems(bundle.activities);
            await reloadTeachingResources(supabase, authUser.id);
          }
        } catch (e) {
          console.error(e);
          if (!cancelled) dbAlert(e);
          if (!cancelled) hydrateLocalTeacher();
        } finally {
          if (!cancelled) setDataReady(true);
        }
        return;
      }

      if (role === "teacher" && user) {
        hydrateLocalTeacher();
        setDataReady(true);
        return;
      }

      setProfileState(defaultProfile());
      setPortfolioItems([]);
      setDataReady(true);
    }

    void loadTeacher();
    return () => {
      cancelled = true;
    };
  }, [authReady, supabase, user, role, hydrateLocalTeacher, reloadTeachingResources]);

  const setProfile = useCallback((next: TeacherProfileState) => {
    setProfileState(next);
  }, []);

  const saveProfile = useCallback(
    async (next: TeacherProfileState) => {
      try {
        if (supabase && user?.id && role === "teacher") {
          await updateTeacherProfileMeta(supabase, user.id, {
            displayName: next.displayName,
            department: next.department,
            academicYearGoals: next.academicYearGoals,
            goalAchievementPercent: next.goalAchievementPercent,
          });
          await refreshTeacherData();
          return;
        }
        setProfileState(next);
        saveTeacherProfile(next);
      } catch (e) {
        dbAlert(e);
        throw e;
      }
    },
    [supabase, user?.id, role, refreshTeacherData],
  );

  const addTeacherGoal = useCallback(
    async (category: string, description: string) => {
      if (supabase && role === "teacher") {
        try {
          await insertTeacherGoalWithAuthSession(supabase, category, description);
          await refreshTeacherData();
        } catch (e) {
          dbAlert(e);
          throw e;
        }
        return;
      }
      const newGoal: TeacherGoal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        category,
        description,
      };
      setProfileState((prev) => {
        const merged = { ...prev, goals: [newGoal, ...prev.goals] };
        saveTeacherProfile(merged);
        return merged;
      });
    },
    [supabase, role, refreshTeacherData],
  );

  const removeTeacherGoal = useCallback(
    async (goalId: string) => {
      if (supabase && user?.id && role === "teacher") {
        try {
          await deleteTeacherGoal(supabase, user.id, goalId);
          await refreshTeacherData();
        } catch (e) {
          dbAlert(e);
          throw e;
        }
        return;
      }
      setProfileState((prev) => {
        const merged = { ...prev, goals: prev.goals.filter((g) => g.id !== goalId) };
        saveTeacherProfile(merged);
        return merged;
      });
    },
    [supabase, user?.id, role, refreshTeacherData],
  );

  const addPortfolioItem = useCallback(
    async (item: Omit<PortfolioItem, "id">) => {
      try {
        if (supabase && user?.id && role === "teacher") {
          await insertActivity(supabase, user.id, item);
          await refreshTeacherData();
          return;
        }
      } catch (e) {
        dbAlert(e);
        throw e;
      }
      const updated = storageAddPortfolio(item);
      setPortfolioItems(updated);
    },
    [supabase, user?.id, role, refreshTeacherData],
  );

  const updatePortfolioItem = useCallback(
    async (id: string, patch: Omit<PortfolioItem, "id">) => {
      try {
        if (supabase && user?.id && role === "teacher") {
          await updateActivity(supabase, user.id, id, patch);
          await refreshTeacherData();
          return;
        }
      } catch (e) {
        dbAlert(e);
        throw e;
      }
      const updated = storageUpdatePortfolio(id, patch);
      setPortfolioItems(updated);
    },
    [supabase, user?.id, role, refreshTeacherData],
  );

  const deletePortfolioItem = useCallback(
    async (id: string) => {
      try {
        if (supabase && user?.id && role === "teacher") {
          await deleteActivity(supabase, user.id, id);
          await refreshTeacherData();
          return;
        }
      } catch (e) {
        dbAlert(e);
        throw e;
      }
      const updated = storageDeletePortfolio(id);
      setPortfolioItems(updated);
    },
    [supabase, user?.id, role, refreshTeacherData],
  );

  const toggleResourceLike = useCallback(
    async (id: string, likedByMe: boolean) => {
      if (supabase && role === "teacher") {
        try {
          await toggleResourceLikeRow(supabase, id, likedByMe);
          const {
            data: { user: authUser },
          } = await supabase.auth.getUser();
          if (authUser?.id) await reloadTeachingResources(supabase, authUser.id);
        } catch (e) {
          console.error(e);
          dbAlert(e);
        }
        return;
      }
      setTeachingResources((prev) => {
        const next = prev.map((r) =>
          r.id === id
            ? {
                ...r,
                likedByMe: !r.likedByMe,
                likes: r.likedByMe ? Math.max(0, r.likes - 1) : r.likes + 1,
              }
            : r,
        );
        window.localStorage.setItem(RESOURCES_KEY, JSON.stringify(next));
        return next;
      });
    },
    [supabase, role, reloadTeachingResources],
  );

  const addTeachingResource = useCallback(
    async (input: Omit<TeachingResource, "id" | "likes" | "likedByMe" | "createdAt">) => {
      try {
        if (supabase && role === "teacher") {
          const {
            data: { user: authUser },
            error: authErr,
          } = await supabase.auth.getUser();
          if (authErr || !authUser?.id) {
            throw new Error(authErr?.message ?? "ไม่พบผู้ใช้");
          }
          let publicUrl = input.imageUrl;
          if (publicUrl.startsWith("blob:") || publicUrl.startsWith("data:")) {
            const res = await fetch(publicUrl);
            const blob = await res.blob();
            const ext = (blob.type.split("/")[1] ?? "jpeg").replace("jpeg", "jpg");
            const path = `${authUser.id}/teaching-resource-${Date.now()}.${ext}`;
            const { error: upError } = await supabase.storage.from("avatars").upload(path, blob, {
              upsert: true,
              contentType: blob.type || "image/jpeg",
            });
            if (upError) throw upError;
            const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
            publicUrl = pub.publicUrl;
            if (input.imageUrl.startsWith("blob:")) URL.revokeObjectURL(input.imageUrl);
          }
          await insertTeachingResourceRow(supabase, {
            title: input.title,
            category: input.category,
            imageUrl: publicUrl,
          });
          await reloadTeachingResources(supabase, authUser.id);
          return;
        }
      } catch (e) {
        dbAlert(e);
        throw e;
      }
      setTeachingResources((prev) => {
        const row: TeachingResource = {
          ...input,
          id: `res-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          likes: 0,
          likedByMe: false,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        const next = [row, ...prev];
        window.localStorage.setItem(RESOURCES_KEY, JSON.stringify(next));
        return next;
      });
    },
    [supabase, role, reloadTeachingResources],
  );

  const value = useMemo<AppDataContextValue>(
    () => ({
      dataReady,
      profile,
      portfolioItems,
      teachingResources,
      executiveWorkload,
      executiveDashboard,
      executiveDashboardLoading,
      refreshExecutiveDashboard,
      usesSupabaseData,
      setProfile,
      saveProfile,
      addTeacherGoal,
      removeTeacherGoal,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      refreshTeacherData,
      toggleResourceLike,
      addTeachingResource,
    }),
    [
      dataReady,
      profile,
      portfolioItems,
      teachingResources,
      executiveWorkload,
      executiveDashboard,
      executiveDashboardLoading,
      refreshExecutiveDashboard,
      usesSupabaseData,
      setProfile,
      saveProfile,
      addTeacherGoal,
      removeTeacherGoal,
      addPortfolioItem,
      updatePortfolioItem,
      deletePortfolioItem,
      refreshTeacherData,
      toggleResourceLike,
      addTeachingResource,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return ctx;
}
