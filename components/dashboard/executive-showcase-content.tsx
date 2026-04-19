"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Award, Filter } from "lucide-react";
import { SHOWCASE_DATA } from "@/lib/executive-showcase-data";

export function ExecutiveShowcaseContent() {
  const [categoryId, setCategoryId] = useState(SHOWCASE_DATA[0]?.id ?? "");
  const [subId, setSubId] = useState(
    SHOWCASE_DATA[0]?.subCategories[0]?.id ?? "",
  );

  const category = useMemo(
    () => SHOWCASE_DATA.find((c) => c.id === categoryId) ?? SHOWCASE_DATA[0],
    [categoryId],
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
              แสดงครูต้นแบบตามหมวดหมู่และหมวดหมู่ย่อย พร้อมความสามารถเด่น
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-col gap-1 text-xs font-bold text-slate-700">
              หมวดหมู่หลัก
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const next = SHOWCASE_DATA.find((c) => c.id === e.target.value);
                  setSubId(next?.subCategories[0]?.id ?? "");
                }}
                className="min-w-[200px] rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
              >
                {SHOWCASE_DATA.map((c) => (
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
                  />
                </div>
                <div className="space-y-3 p-4">
                  <h3 className="text-lg font-bold text-slate-900">{t.name}</h3>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    ความสามารถเด่น
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {t.topSkills.map((skill) => (
                      <span
                        key={skill}
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
        </section>
      ) : null}
    </div>
  );
}
