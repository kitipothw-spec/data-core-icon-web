"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { supabase } from "@/lib/supabase";

type CourseRow = {
  id: string;
  title: string;
  cover: string;
  category: string;
  applyRange: string;
  trainingRange: string;
  link: string;
};

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80";

export function AdminCourseManagement() {
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState("");
  const [courseCover, setCourseCover] = useState("");
  const [courseCategory, setCourseCategory] = useState("การพัฒนาวิชาชีพ");
  const [applyRange, setApplyRange] = useState("");
  const [trainingRange, setTrainingRange] = useState("");
  const [courseLink, setCourseLink] = useState("");

  const loadCourses = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCourses([]);
      setLoading(false);
      return;
    }
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, cover_url, category, apply_range, training_range, link")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = (data ?? []) as {
        id: string;
        title: string;
        cover_url: string;
        category: string;
        apply_range: string;
        training_range: string;
        link: string;
      }[];
      setCourses(
        rows.map((r) => ({
          id: r.id,
          title: r.title,
          cover: r.cover_url || DEFAULT_COVER,
          category: r.category,
          applyRange: r.apply_range,
          trainingRange: r.training_range,
          link: r.link || "#",
        })),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  async function addCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!courseTitle.trim()) return;
    if (!isSupabaseConfigured()) {
      alert("เกิดข้อผิดพลาด: ยังไม่ได้ตั้งค่า Supabase");
      return;
    }
    try {
      const { error } = await supabase.from("courses").insert({
        title: courseTitle.trim(),
        cover_url: courseCover.trim() || DEFAULT_COVER,
        category: courseCategory,
        apply_range: applyRange.trim() || "กำหนดภายหลัง",
        training_range: trainingRange.trim() || "กำหนดภายหลัง",
        link: courseLink.trim() || "https://example.go.th",
      });
      if (error) throw error;
      setCourseTitle("");
      setCourseCover("");
      setApplyRange("");
      setTrainingRange("");
      setCourseLink("");
      await loadCourses();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
    }
  }

  async function deleteCourse(id: string) {
    try {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
      await loadCourses();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
      <h2 className="text-lg font-bold text-slate-900">จัดการหลักสูตร / ดึงข้อมูลภายนอก</h2>
      <p className="text-sm text-slate-600">
        เพิ่มและลบหลักสูตรในตาราง courses — ข้อมูลจะแสดงในแดชบอร์ดครูเมื่อโหลดจากฐานข้อมูล
      </p>
      <form onSubmit={(ev) => void addCourse(ev)} className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
          ชื่อการอบรม
          <input
            value={courseTitle}
            onChange={(e) => setCourseTitle(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none ring-orange-400/30 focus:ring-4"
            placeholder="เช่น การจัดการเรียนรู้แบบโครงงาน"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
          รูปหน้าปก (URL)
          <input
            value={courseCover}
            onChange={(e) => setCourseCover(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none ring-orange-400/30 focus:ring-4"
            placeholder="https://..."
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
          หมวดหมู่
          <select
            value={courseCategory}
            onChange={(e) => setCourseCategory(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none ring-orange-400/30 focus:ring-4"
          >
            <option>การพัฒนาวิชาชีพ</option>
            <option>เทคโนโลยีการศึกษา</option>
            <option>การวัดและประเมินผล</option>
            <option>ภาวะผู้นำทางวิชาการ</option>
          </select>
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
          ช่วงเวลาสมัคร
          <input
            value={applyRange}
            onChange={(e) => setApplyRange(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none ring-orange-400/30 focus:ring-4"
            placeholder="เช่น 1 พ.ค. - 31 พ.ค. 2568"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
          ช่วงเวลาอบรม
          <input
            value={trainingRange}
            onChange={(e) => setTrainingRange(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none ring-orange-400/30 focus:ring-4"
            placeholder="เช่น 10 มิ.ย. - 14 มิ.ย. 2568"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
          ลิงก์สมัคร
          <input
            value={courseLink}
            onChange={(e) => setCourseLink(e.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal outline-none ring-orange-400/30 focus:ring-4"
            placeholder="https://..."
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            className="rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
          >
            บันทึกหลักสูตร
          </button>
        </div>
      </form>

      {loading ? (
        <p className="mt-6 text-center text-sm font-semibold text-slate-600">กำลังโหลดหลักสูตร...</p>
      ) : null}
      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[800px] border-separate border-spacing-0 text-sm">
          <thead>
            <tr className="text-left text-xs font-bold uppercase tracking-wide text-slate-500">
              <th className="rounded-l-2xl bg-slate-100 px-3 py-3">รหัส</th>
              <th className="bg-slate-100 px-3 py-3">ชื่อการอบรม</th>
              <th className="bg-slate-100 px-3 py-3">หมวดหมู่</th>
              <th className="bg-slate-100 px-3 py-3">ช่วงเวลาสมัคร</th>
              <th className="bg-slate-100 px-3 py-3">ช่วงเวลาอบรม</th>
              <th className="bg-slate-100 px-3 py-3">ลิงก์สมัคร</th>
              <th className="rounded-r-2xl bg-slate-100 px-3 py-3 text-right">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 last:border-0">
                <td className="px-3 py-3 font-mono text-xs text-slate-600">{c.id}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cover} alt="" className="h-10 w-14 rounded-lg object-cover" />
                    <span className="font-semibold text-slate-900">{c.title}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-700">{c.category}</td>
                <td className="px-3 py-3 text-slate-700">{c.applyRange}</td>
                <td className="px-3 py-3 text-slate-700">{c.trainingRange}</td>
                <td className="px-3 py-3">
                  <a className="font-semibold text-orange-600 underline" href={c.link}>
                    เปิดลิงก์
                  </a>
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => void deleteCourse(c.id)}
                    className="rounded-xl border border-red-100 bg-red-50 p-2 text-red-700"
                    aria-label={`ลบ ${c.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
