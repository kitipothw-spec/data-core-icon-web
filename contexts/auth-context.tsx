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
import { getDashboardHomeForRole } from "@/lib/auth-routes";
import { AVATARS_BUCKET, buildPublicAvatarObjectPath } from "@/lib/supabase/avatar-storage";
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

export type LoginResult = {
  ok: boolean;
  error?: string;
  /** ข้อความดิบจากระบบ (สำหรับ debug ใน alert) */
  errorDetail?: string;
  redirectPath?: string;
};

type AuthContextValue = {
  user: SessionUser | null;
  role: UserRole | null;
  authReady: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  updateProfileImage: (input: string | null | File) => Promise<void>;
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

/** อนุมานบทบาทจากส่วนก่อน @ ในอีเมล (เช่น admin@test.com → admin) */
function inferRoleFromEmailPrefix(email: string | null | undefined): UserRole {
  const local = (email ?? "").trim().split("@")[0]?.toLowerCase() ?? "";
  if (!local) return "teacher";
  if (local.startsWith("admin")) return "admin";
  if (local.startsWith("boss")) return "executive";
  if (local.startsWith("teacher")) return "teacher";
  return "teacher";
}

async function ensureProfileAndBuildSessionUser(
  supabase: ReturnType<typeof createBrowserSupabaseClient>,
  session: Session,
): Promise<SessionUser> {
  const uid = session.user.id;
  const email = session.user.email ?? "";

  const { data: existing, error: selErr } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
  if (selErr) {
    throw new Error(selErr.message);
  }

  let profile = existing as ProfileRow | Record<string, unknown> | null;

  if (!profile) {
    const inferred = inferRoleFromEmailPrefix(email);
    const fullName =
      (session.user.user_metadata?.full_name as string | undefined) ?? `${inferred.toUpperCase()} User`;

    const { error: insErr } = await supabase.from("profiles").insert({
      id: uid,
      email: email || null,
      full_name: fullName,
      role: inferred,
      department: "",
    });

    if (insErr) {
      if (insErr.code === "23505") {
        const { data: again, error: againErr } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
        if (againErr) throw new Error(againErr.message);
        if (!again) throw new Error("โปรไฟล์อาจมีอยู่แล้วแต่ดึงข้อมูลไม่ได้ (RLS หรือสิทธิ์)");
        profile = again as ProfileRow;
      } else {
        throw new Error(insErr.message);
      }
    } else {
      const { data: created, error: readErr } = await supabase.from("profiles").select("*").eq("id", uid).maybeSingle();
      if (readErr) throw new Error(readErr.message);
      if (!created) throw new Error("insert profiles สำเร็จแต่ select ไม่พบแถว — ตรวจ RLS");
      profile = created as ProfileRow;
    }
  }

  const p = profile as ProfileRow | null;
  if (!p) {
    throw new Error("ไม่มีข้อมูลโปรไฟล์หลังตรวจสอบแล้ว");
  }
  return {
    id: uid,
    email,
    name: p.full_name ?? email.split("@")[0] ?? "User",
    role: mapRole(p.role ?? null),
    department: p.department ?? "",
    profileImage: p.avatar_url ?? null,
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
      void ensureProfileAndBuildSessionUser(supabase, session)
        .then(setUser)
        .catch((e) => {
          console.error(e);
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            name: session.user.email?.split("@")[0] ?? "User",
            role: inferRoleFromEmailPrefix(session.user.email),
            department: "",
            profileImage: null,
          });
        });
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

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    if (!usesSupabase) {
      const found = findMockUser(email, password);
      if (!found) {
        return { ok: false, error: "ไม่พบอีเมลหรือรหัสผ่านไม่ถูกต้อง", errorDetail: "mock: no matching user" };
      }
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
      return { ok: true, redirectPath: getDashboardHomeForRole(found.role) };
    }

    const supabase = createBrowserSupabaseClient();
    try {
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        const raw = signInErr.message;
        const invalid =
          raw === "Invalid login credentials" ||
          /invalid login credentials/i.test(raw) ||
          /invalid email or password/i.test(raw);
        return {
          ok: false,
          error: invalid ? "ไม่พบอีเมลหรือรหัสผ่านไม่ถูกต้อง" : "เข้าสู่ระบบไม่สำเร็จ",
          errorDetail: raw,
        };
      }

      let session: Session | null = signInData.session ?? null;
      if (!session) {
        try {
          const { data: refreshed } = await supabase.auth.refreshSession();
          session = refreshed.session ?? null;
        } catch {
          session = null;
        }
      }
      if (!session) {
        const { data: got } = await supabase.auth.getSession();
        session = got.session ?? null;
      }
      if (!session) {
        return {
          ok: false,
          error: "ไม่พบเซสชันหลังเข้าสู่ระบบ",
          errorDetail:
            "ลองปิดการยืนยันอีเมลชั่วคราวใน Supabase Auth หรือยืนยันอีเมลก่อน — signIn ไม่คืน session",
        };
      }

      const sessionUser = await ensureProfileAndBuildSessionUser(supabase, session);
      setUser(sessionUser);
      return { ok: true, redirectPath: getDashboardHomeForRole(sessionUser.role) };
    } catch (e) {
      const detail = e instanceof Error ? e.message : String(e);
      return {
        ok: false,
        error: "เกิดปัญหาที่ฐานข้อมูลหรือโปรไฟล์",
        errorDetail: detail,
      };
    }
  }, [usesSupabase]);

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
    async (input: string | null | File) => {
      if (!usesSupabase) {
        const url = input instanceof File ? URL.createObjectURL(input) : input;
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, profileImage: url };
          window.localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(next));
          return next;
        });
        return;
      }

      const supabase = createBrowserSupabaseClient();
      const {
        data: { user: authUser },
        error: authErr,
      } = await supabase.auth.getUser();
      if (authErr || !authUser) {
        throw new Error(authErr?.message ?? "ไม่พบผู้ใช้ที่ล็อกอิน — กรุณาเข้าสู่ระบบใหม่");
      }
      const uid = authUser.id;

      if (input === null) {
        await updateProfileAvatarUrl(supabase, uid, null);
        setUser((prev) => (prev ? { ...prev, profileImage: null } : null));
        return;
      }

      if (input instanceof File) {
        const path = buildPublicAvatarObjectPath(uid);
        const { error: upError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, input, {
          upsert: true,
          contentType: input.type || "image/png",
        });
        if (upError) throw new Error(upError.message);
        const { data: pub } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
        await updateProfileAvatarUrl(supabase, uid, pub.publicUrl);
        setUser((prev) => (prev ? { ...prev, profileImage: pub.publicUrl } : null));
        return;
      }

      if (input.startsWith("blob:") || input.startsWith("data:")) {
        const res = await fetch(input);
        const blob = await res.blob();
        const path = buildPublicAvatarObjectPath(uid);
        const { error: upError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, blob, {
          upsert: true,
          contentType: blob.type || "image/png",
        });
        if (upError) throw new Error(upError.message);
        const { data: pub } = supabase.storage.from(AVATARS_BUCKET).getPublicUrl(path);
        await updateProfileAvatarUrl(supabase, uid, pub.publicUrl);
        if (input.startsWith("blob:")) URL.revokeObjectURL(input);
        setUser((prev) => (prev ? { ...prev, profileImage: pub.publicUrl } : null));
        return;
      }

      await updateProfileAvatarUrl(supabase, uid, input);
      setUser((prev) => (prev ? { ...prev, profileImage: input } : null));
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
