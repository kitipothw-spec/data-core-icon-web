"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Download, Heart, LayoutGrid, Plus, X } from "lucide-react";
import { useAppData } from "@/contexts/app-data-context";

const RESOURCE_CATEGORIES = [
  "สื่อ AI",
  "แผนการสอน",
  "สื่อดิจิทัล",
  "สื่อมัลติมีเดีย",
  "นวัตกรรมการสอน",
  "อื่น ๆ",
] as const;

export function TeacherResourceHubContent() {
  const { teachingResources, toggleResourceLike, addTeachingResource } = useAppData();
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(RESOURCE_CATEGORIES[0]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [previewUrl]);

  function closeModal() {
    setModalOpen(false);
    setTitle("");
    setCategory(RESOURCE_CATEGORIES[0]);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setHint(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    if (!t) {
      setHint("กรุณากรอกชื่อสื่อ");
      return;
    }
    if (!previewUrl) {
      setHint("กรุณาเลือกรูปภาพตัวอย่าง");
      return;
    }
    try {
      await addTeachingResource({
        title: t,
        category,
        imageUrl: previewUrl,
      });
      closeModal();
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  function handleDownload(titleText: string) {
    const blob = new Blob(
      [`คลังสื่อการสอน DATA-CORE-ICON\n${titleText}\n(ไฟล์ตัวอย่าง — เชื่อม Firebase/Storage จริงเมื่อพร้อม)`],
      { type: "text/plain;charset=utf-8" },
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${titleText.slice(0, 40)}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white shadow-md">
              <LayoutGrid className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">คลังนวัตกรรมและสื่อการสอน</h1>
              <p className="mt-1 text-sm text-slate-600">
                แบ่งปันสื่อคุณภาพสูงในรูปแบบ Masonry — กดถูกใจ ดาวน์โหลด และอัปโหลดสื่อของคุณ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
          >
            <Plus className="h-4 w-4" />
            แบ่งปันสื่อของคุณ
          </button>
        </div>
      </header>

      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {teachingResources.map((item) => (
          <article
            key={item.id}
            className="mb-5 break-inside-avoid rounded-[24px] border border-white/70 bg-white/70 shadow-lg backdrop-blur-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-t-[24px] bg-slate-100">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 33vw"
                unoptimized={item.imageUrl.startsWith("blob:")}
              />
            </div>
            <div className="space-y-3 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600">{item.category}</p>
              <h2 className="text-base font-bold leading-snug text-slate-900">{item.title}</h2>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void toggleResourceLike(item.id, item.likedByMe)}
                  className={`inline-flex items-center gap-1.5 rounded-2xl border px-3 py-2 text-xs font-bold transition ${
                    item.likedByMe
                      ? "border-rose-300 bg-rose-50 text-rose-700"
                      : "border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <Heart className={`h-4 w-4 ${item.likedByMe ? "fill-rose-500 text-rose-600" : ""}`} />
                  {item.likes}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(item.title)}
                  className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  <Download className="h-4 w-4" />
                  ดาวน์โหลด
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {modalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resource-modal-title"
        >
          <div className="w-full max-w-lg rounded-[24px] border border-white/60 bg-white/95 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 id="resource-modal-title" className="text-lg font-bold text-slate-900">
                  แบ่งปันสื่อการสอน
                </h2>
                <p className="text-sm text-slate-600">อัปโหลดรูปตัวอย่างและระบุหมวดหมู่ — บันทึกลง Supabase</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-700 transition hover:bg-slate-50"
                aria-label="ปิด"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
                ชื่อสื่อ / ชุดกิจกรรม
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
                  placeholder="เช่น ชุดสื่อ STEM ระดับ ปวช."
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
                หมวดหมู่
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
                >
                  {RESOURCE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
                รูปภาพตัวอย่าง
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFile}
                  className="text-sm font-medium text-slate-700 file:mr-3 file:rounded-2xl file:border-0 file:bg-orange-100 file:px-4 file:py-2 file:text-sm file:font-bold file:text-orange-800"
                />
              </label>
              {previewUrl ? (
                <div className="relative h-40 w-full overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <Image
                    src={previewUrl}
                    alt="ตัวอย่าง"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              {hint ? (
                <p className="text-sm font-semibold text-rose-600" role="status">
                  {hint}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="submit"
                  className="rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
                >
                  เผยแพร่ในคลัง
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-[24px] border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
