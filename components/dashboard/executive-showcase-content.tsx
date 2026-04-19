"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Award, Filter } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { supabase } from "@/lib/supabase";
import { fetchExecutiveShowcaseData, type ShowcaseCategory } from "@/lib/supabase/showcase-queries";

export function ExecutiveShowcaseContent() {
  const [showcase, setShowcase] = useState<ShowcaseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryId, setCategoryId] = useState("");
  const [subId, setSubId] = useState("");

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setShowcase([]);
      setLoading(false);
      return;
    }
    try {
      const data = await fetchExecutiveShowcaseData(supabase);
      setShowcase(data);
      const first = data[0];
      if (first) {
        setCategoryId(first.id);
        setSubId(first.subCategories[0]?.id ?? "");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
      setShowcase([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const category = useMemo(
    () => showcase.find((c) => c.id === categoryId) ?? showcase[0],
    [categoryId, showcase],
  );

  const sub = useMemo(() => {
    const s = category?.subCategories.find((x) => x.id === subId);
    return s ?? category?.subCategories[0];
  }, [category, subId]);

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Award className="h-7 w-7 text-pink-500" />
              <h1 className="text-2xl font-bold text-slate-900">ทำเนียบครูโดดเด่น</h1>
            </div>
            <p className="text-sm text-slate-600">
              แสดงครูตามหมวดหมู่เป้าหมายจากตาราง goals และ profiles
            </p>
            {loading ? (
              <p className="mt-2 text-xs font-semibold text-amber-800">กำลังโหลดข้อมูล...</p>
            ) : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              หมวดหมู่หลัก
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const next = showcase.find((c) => c.id === e.target.value);
                  setSubId(next?.subCategories[0]?.id ?? "");
                }}
                className="min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
                disabled={showcase.length === 0}
              >
                {showcase.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" />
                หมวดหมู่ย่อย
              </span>
              <select
                value={sub?.id ?? ""}
                onChange={(e) => setSubId(e.target.value)}
                className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
                disabled={!category}
              >
                {category?.subCategories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      {sub ? (
        <section>
          <h2 className="mb-4 text-lg font-bold text-slate-800">
            {category?.name} · {sub.name}
          </h2>
          {sub.teachers.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-600">
              ยังไม่มีครูในหมวดนี้ — เมื่อครูบันทึกเป้าหมายในหมวดที่เลือก รายชื่อจะปรากฏที่นี่
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sub.teachers.map((t) => (
                <article
                  key={t.id}
                  className="overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-md backdrop-blur-md"
                >
                  <div className="relative aspect-[4/3] bg-slate-200">
                    <Image
                      src={t.image}
                      alt={t.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized={t.image.startsWith("blob:")}
                    />
                  </div>
                  <div className="space-y-3 p-4">
                    <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      ความสามารถเด่น (จากเป้าหมาย)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {t.topSkills.map((skill, si) => (
                        <span
                          key={`${t.id}-${si}-${skill.slice(0, 12)}`}
                          className="rounded-full bg-gradient-to-r from-orange-100 to-pink-100 px-3 py-1 text-xs font-bold text-slate-800 ring-1 ring-orange-200/80"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
