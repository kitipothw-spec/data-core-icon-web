"use client";

import { useState } from "react";
import Link from "next/link";
import { createBrowserSupabaseClient } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { setupTestAccounts } from "@/lib/supabase/setup-test-accounts";

type Status = "idle" | "running" | "success" | "error";

export default function SetupAccountsPage() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  async function runSetup() {
    if (!isSupabaseConfigured()) {
      setStatus("error");
      setMessage("ไม่พบค่า NEXT_PUBLIC_SUPABASE_* ใน .env.local");
      return;
    }
    setStatus("running");
    setMessage(null);
    try {
      const supabase = createBrowserSupabaseClient();
      await setupTestAccounts(supabase);
      setStatus("success");
      setMessage("สร้างบัญชีทดสอบสำเร็จ — admin@test.com, teacher@test.com, boss@test.com (รหัสผ่าน password123)");
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : String(e));
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white/90 p-8 shadow-lg backdrop-blur-sm">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900">ตั้งค่าบัญชีทดสอบ</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          หน้านี้ไม่แสดงในแอปหลัก — ใช้เฉพาะเมื่อคุณเปิด URL นี้โดยตรงเพื่อสร้างบัญชีทดสอบใน Supabase
        </p>

        <button
          type="button"
          disabled={status === "running"}
          onClick={() => void runSetup()}
          className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {status === "running" ? "กำลังดำเนินการ..." : "สร้างบัญชีทดสอบ (3 ระดับ)"}
        </button>

        {status === "success" ? (
          <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            {message}
          </p>
        ) : null}
        {status === "error" && message ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{message}</p>
        ) : null}

        <Link
          href="/"
          className="mt-8 block text-center text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
        >
          กลับหน้าเข้าสู่ระบบ
        </Link>
      </div>
    </div>
  );
}
