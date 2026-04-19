"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

type Variant = "teacher" | "executive";

const ring: Record<Variant, string> = {
  teacher: "ring-orange-200",
  executive: "ring-indigo-200",
};

const emptyBg: Record<Variant, string> = {
  teacher: "from-orange-200 to-pink-200",
  executive: "from-indigo-200 to-sky-200",
};

export function ProfileAvatarUploadSection({
  variant,
  title = "ข้อมูลส่วนตัว",
  description = "อัปโหลดรูปโปรไฟล์เพื่อแสดงในระบบและแถบด้านข้าง",
}: {
  variant: Variant;
  title?: string;
  description?: string;
}) {
  const { user, updateProfileImage } = useAuth();
  const [preview, setPreview] = useState<string | null>(user?.profileImage ?? null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setPreview(user?.profileImage ?? null);
  }, [user?.profileImage]);

  const initials = (() => {
    if (!user?.name) return variant === "executive" ? "E" : "C";
    const parts = user.name.trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || (variant === "executive" ? "E" : "C");
  })();

  const onPick = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      setBusy(true);
      try {
        await updateProfileImage(file);
      } catch (err) {
        alert("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setBusy(false);
      }
    },
    [updateProfileImage],
  );

  return (
    <section className="mb-6 rounded-[24px] border border-slate-100 bg-white/70 p-5">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      <p className="mt-1 text-sm text-slate-600">{description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-5">
        <label className={`group relative block cursor-pointer ${busy ? "pointer-events-none opacity-70" : ""}`}>
          <input type="file" accept="image/*" className="sr-only" onChange={(ev) => void onPick(ev)} disabled={busy} />
          <div className={`relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-lg ring-2 ${ring[variant]}`}>
            {preview ? (
              <Image
                src={preview}
                alt="รูปโปรไฟล์"
                fill
                className="object-cover"
                sizes="112px"
                unoptimized={preview.startsWith("blob:") || preview.startsWith("data:")}
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${emptyBg[variant]} text-sm font-semibold text-slate-700`}
              >
                {variant === "executive" ? initials : "ยังไม่มีรูป"}
              </div>
            )}
          </div>
          <span className="absolute bottom-1 right-1 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white shadow-md transition group-hover:scale-105">
            <Camera className="h-4 w-4" />
          </span>
        </label>
        <div className="text-xs font-semibold text-slate-600">
          <p>แตะที่รูปเพื่อเลือกไฟล์ — บันทึกลง Supabase Storage (avatars)</p>
          {busy ? <p className="mt-1 text-orange-700">กำลังอัปโหลด...</p> : null}
          <p className="mt-1 font-medium text-slate-500">
            {user?.name ?? (variant === "executive" ? "ผู้บริหาร" : "ครู")} · {user?.department ?? "-"}
          </p>
        </div>
      </div>
    </section>
  );
}
