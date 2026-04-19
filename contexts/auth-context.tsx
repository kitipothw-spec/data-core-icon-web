"use client";

import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { updateProfileAvatarUrl } from "@/lib/supabase/teacher-queries";
import { findMockUser } from "@/lib/mock-users";

export type UserRole = "teacher" | "executive" | "admin";

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  profileImage: string | null;
};

type AuthContextValue = {
  user: SessionUser | null;
  role: UserRole | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfileImage: (image: string | null) => Promise<void>;
  /** true when using Supabase Auth; false = legacy mock (no env vars) */
  usesSupabase: boolean;
};

const LEGACY_STORAGE_KEY = "data-core-icon-session";

function parseLegacyUser(raw: string | null): SessionUser | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return null;
    const o = data as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "legacy-user";
    const email = typeof o.email === "string" ? o.email : "";
    const name = typeof o.name === "string" ? o.name : "";
    const department = typeof o.department === "string" ? o.department : "";
    const profileImage = typeof o.profileImage === "string" ? o.profileImage : null;
    const role = o.role;
    if (role !== "teacher" && role !== "executive" && role !== "admin") return null;
    if (!email) return null;
    return { id, email, name, role, department, profileImage };
  } catch {
    return null;
  }
}

type ProfileRow = {
  full_name: string | null;
  department: string | null;
  role: string | null;
  avatar_url: string | null;
};

function mapRole(r: string | null): UserRole {
  if (r === "executive" || r === "admin" || r === "teacher") return r;
  return "teacher";
}

async function fetchSessionUserFromSupabase(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  session: Session,
): Promise<SessionUser> {
  const uid = session.user.id;
  let { data: profile } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: uid,
      email: session.user.email,
      full_name:
        (session.user.user_metadata?.full_name as string | undefined) ??
        session.user.email?.split("@")[0] ??
        "User",
      role: "teacher",
      department: "",
    });
    const res = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
    profile = res.data;
  }

  const p = profile as ProfileRow | null;
  return {
    id: uid,
    email: session.user.email ?? "",
    name: p?.full_name ?? session.user.email?.split("@")[0] ?? "User",
    role: mapRole(p?.role ?? null),
    department: p?.department ?? "",
    profileImage: p?.avatar_url ?? null,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const usesSupabase = isSupabaseConfigured();

  useEffect(() => {
    if (!usesSupabase) {
      const raw = window.localStorage.getItem(LEGACY_STORAGE_KEY);
      const restored = parseLegacyUser(raw);
      startTransition(() => {
        setUser(restored);
        setAuthReady(true);
      });
      return;
    }

    const supabase = createBrowserSupabaseClient();

    function applySession(session: Session | null) {
      if (!session) {
        setUser(null);
        return;
      }
      void fetchSessionUserFromSupabase(supabase, session).then(setUser);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => subscription.unsubscribe();
  }, [usesSupabase]);

  const login = useCallback(
    async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
      if (!usesSupabase) {
        const found = findMockUser(email, password);
        if (!found) return { ok: false, error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" };
        const session: SessionUser = {
          id: `legacy-${found.email}`,
          email: found.email,
          name: found.name,
          role: found.role,
          department: found.department,
          profileImage: null,
        };
        setUser(session);
        window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(session));
        return { ok: true };
      }

      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { ok: false, error: error.message === "Invalid login credentials" ? "อีเมลหรือรหัสผ่านไม่ถูกต้อง" : error.message };
      }
      return { ok: true };
    },
    [usesSupabase],
  );

  const logout = useCallback(async () => {
    if (usesSupabase) {
      const supabase = createBrowserSupabaseClient();
      await supabase.auth.signOut();
      setUser(null);
    } else {
      setUser(null);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    }
  }, [usesSupabase]);

  const updateProfileImage = useCallback(
    async (image: string | null) => {
      if (!usesSupabase) {
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, profileImage: image };
          window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;

      if (!image) {
        await updateProfileAvatarUrl(supabase, uid, null);
        setUser((prev) => (prev ? { ...prev, profileImage: null } : null));
        return;
      }

      if (image.startsWith("blob:") || image.startsWith("data:")) {
        const res = await fetch(image);
        const blob = await res.blob();
        const ext = (blob.type.split("/")[1] ?? "jpeg").replace("jpeg", "jpg");
        const path = `${uid}/${Date.now()}.${ext}`;
        const { error: upError } = await supabase.storage.from("avatars").upload(path, blob, {
          upsert: true,
          contentType: blob.type || "image/jpeg",
        });
        if (upError) {
          console.error(upError);
          return;
        }
        const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
        await updateProfileAvatarUrl(supabase, uid, pub.publicUrl);
        if (image.startsWith("blob:")) URL.revokeObjectURL(image);
        setUser((prev) => (prev ? { ...prev, profileImage: pub.publicUrl } : null));
        return;
      }

      await updateProfileAvatarUrl(supabase, uid, image);
      setUser((prev) => (prev ? { ...prev, profileImage: image } : null));
    },
    [usesSupabase],
  );

  const role = user?.role ?? null;

  const value = useMemo(
    () => ({ user, role, authReady, login, logout, updateProfileImage, usesSupabase }),
    [user, role, authReady, login, logout, updateProfileImage, usesSupabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
