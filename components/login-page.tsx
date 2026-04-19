"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function LoginPage() {
  const router = useRouter();
  const { user, authReady, login, usesSupabase } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    if (user) {
      router.replace("/dashboard");
    }
  }, [authReady, user, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error ?? "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    router.push("/dashboard");
  }

  if (!authReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-600">
        กำลังโหลด...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] text-slate-600">
        กำลังเข้าสู่แดชบอร์ด...
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-1 items-center justify-center overflow-hidden bg-[#F8FAFC] px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-200/40 via-pink-100/30 to-transparent" />
      <div className="pointer-events-none absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-orange-300/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-1/4 h-80 w-80 rounded-full bg-pink-400/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[24px] border border-white/60 bg-white/40 p-8 shadow-2xl shadow-orange-500/10 backdrop-blur-xl">
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-lg shadow-pink-500/30">
              <GraduationCap className="h-9 w-9" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">DATA-CORE-ICON</h1>
            <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-slate-600">
              <Sparkles className="h-4 w-4 text-orange-500" />
              แพลตฟอร์มพัฒนาครูและข้อมูลสมรรถนะ
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
              อีเมล
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 placeholder:text-slate-400 focus:ring-4"
                  placeholder="name@example.com"
                />
              </div>
            </label>
            <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
              รหัสผ่าน
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 placeholder:text-slate-400 focus:ring-4"
                  placeholder="••••••••"
                />
              </div>
            </label>

            {error ? (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3.5 text-center text-sm font-bold text-white shadow-md shadow-orange-400/30 transition hover:brightness-105 enabled:active:scale-[0.99] disabled:opacity-60"
            >
              {submitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-500">
            {usesSupabase
              ? "เข้าสู่ระบบผ่าน Supabase Auth — สร้างผู้ใช้ได้ที่แดชบอร์ด Supabase (Authentication)"
              : "โหมดสาธิต: ไม่พบค่า Supabase ใน .env — ใช้บัญชีจำลองจาก mock-users"}
          </p>
        </div>
      </div>
    </div>
  );
}
