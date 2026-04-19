"use client";

import { startTransition, useEffect, useState } from "react";
import { Target } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ProfileAvatarUploadSection } from "@/components/dashboard/profile-avatar-upload-section";
import { useAppData } from "@/contexts/app-data-context";
import type { TeacherProfileState } from "@/lib/teacher-storage";

const GOAL_CATEGORIES = [
  "ด้านการจัดการเรียนการสอน (Teaching)",
  "ด้านการพัฒนาวิชาชีพ/ทักษะเฉพาะทาง (Professional Skills)",
  "ด้านงานวิจัยและนวัตกรรม (Research & Innovation)",
  "ด้านการดูแลช่วยเหลือนักเรียน (Student Support)",
  "ด้านงานบริหาร/งานพิเศษ (Administration)",
  "ด้านคุณธรรม จริยธรรม และจรรยาบรรณ (Ethics)",
  "ด้านสื่อการเรียนการสอน (Instructional Media)",
  "ด้านการประยุกต์ใช้ AI ในการศึกษา (AI in Education)",
  "ด้านทักษะดิจิทัลและเทคโนโลยี (Digital Literacy & Tech)",
  "ด้านการพัฒนาทักษะแห่งศตวรรษที่ 21 (21st Century Skills)",
] as const;

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  "ด้านการจัดการเรียนการสอน (Teaching)": "from-orange-400 to-amber-400 text-white",
  "ด้านการพัฒนาวิชาชีพ/ทักษะเฉพาะทาง (Professional Skills)":
    "from-pink-500 to-rose-500 text-white",
  "ด้านงานวิจัยและนวัตกรรม (Research & Innovation)":
    "from-violet-500 to-fuchsia-500 text-white",
  "ด้านการดูแลช่วยเหลือนักเรียน (Student Support)":
    "from-emerald-400 to-green-500 text-white",
  "ด้านงานบริหาร/งานพิเศษ (Administration)": "from-slate-500 to-slate-700 text-white",
  "ด้านคุณธรรม จริยธรรม และจรรยาบรรณ (Ethics)": "from-yellow-400 to-orange-500 text-white",
  "ด้านสื่อการเรียนการสอน (Instructional Media)": "from-indigo-500 to-sky-500 text-white",
  "ด้านการประยุกต์ใช้ AI ในการศึกษา (AI in Education)":
    "from-purple-600 to-blue-500 text-white",
  "ด้านทักษะดิจิทัลและเทคโนโลยี (Digital Literacy & Tech)":
    "from-cyan-500 to-teal-500 text-white",
  "ด้านการพัฒนาทักษะแห่งศตวรรษที่ 21 (21st Century Skills)":
    "from-blue-500 to-indigo-600 text-white",
};

export function TeacherProfileContent() {
  const { user } = useAuth();
  const { profile, saveProfile, addTeacherGoal, removeTeacherGoal, dataReady } = useAppData();
  const [form, setForm] = useState<TeacherProfileState>(profile);
  const [saved, setSaved] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(GOAL_CATEGORIES[0]);
  const [goalDescription, setGoalDescription] = useState("");
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalSuccess, setGoalSuccess] = useState(false);

  useEffect(() => {
    if (!dataReady) return;
    startTransition(() => {
      if (!profile.displayName && user?.name) {
        setForm({
          ...profile,
          displayName: user.name,
          department: user.department || profile.department,
        });
      } else {
        setForm(profile);
      }
    });
  }, [dataReady, profile, user?.name, user?.department]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      await saveProfile(form);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch {
      /* saveProfile แจ้ง alert แล้วใน AppData */
    }
  }

  async function addGoalItem() {
    const nextDescription = goalDescription.trim();
    if (!nextDescription) return;
    setGoalSaving(true);
    setGoalSuccess(false);
    try {
      await addTeacherGoal(selectedCategory, nextDescription);
      setGoalDescription("");
      setGoalSuccess(true);
      window.setTimeout(() => setGoalSuccess(false), 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setGoalSaving(false);
    }
  }

  async function removeGoalItem(goalId: string) {
    await removeTeacherGoal(goalId);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-md">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">ข้อมูลส่วนตัวและเป้าหมาย</h1>
            <p className="text-sm text-slate-600">
              อัปเดตข้อมูลพื้นฐานและบันทึกเป้าหมายการพัฒนาในปีการศึกษานี้
            </p>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSave}
        className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md"
      >
        <ProfileAvatarUploadSection variant="teacher" />

        <div className="grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
            ชื่อ-นามสกุล
            <input
              value={form.displayName}
              onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
              required
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-bold text-slate-800">
            แผนกวิชา / กลุ่มสาระ
            <input
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
              required
            />
          </label>
        </div>

        <div className="mt-6 rounded-[24px] border border-slate-100 bg-white/70 p-5">
          <h2 className="text-base font-bold text-slate-900">เพิ่มเป้าหมายใหม่</h2>
          <p className="mt-1 text-sm text-slate-600">
            เลือกหมวดหมู่และระบุรายละเอียดเป้าหมาย จากนั้นกดบันทึกเป้าหมาย
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
              aria-label="เลือกหมวดหมู่เป้าหมาย"
            >
              {GOAL_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="รายละเอียดเป้าหมาย เช่น active learn หรือ เลี้ยงกุ้ง"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 outline-none ring-orange-400/30 focus:ring-4 md:col-span-2"
            />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={goalSaving}
              onClick={() => void addGoalItem()}
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {goalSaving ? "กำลังบันทึก..." : "บันทึกเป้าหมาย"}
            </button>
            {goalSuccess ? (
              <span className="text-sm font-semibold text-emerald-600" role="status">
                บันทึกสำเร็จ
              </span>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3">
            {form.goals.length === 0 ? (
              <p className="text-xs font-medium text-slate-500">ยังไม่มีเป้าหมายที่บันทึกไว้</p>
            ) : (
              form.goals.map((goal, idx) => (
                <article
                  key={goal.id}
                  className="rounded-[24px] border border-white/80 bg-white/80 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-slate-500">เป้าหมายที่ {idx + 1}</p>
                      <span
                        className={`mt-1 inline-flex rounded-full bg-gradient-to-r px-3 py-1.5 text-xs font-bold shadow-sm ${
                          CATEGORY_BADGE_STYLES[goal.category] ?? "from-slate-500 to-slate-700 text-white"
                        }`}
                      >
                        {goal.category}
                      </span>
                      <p className="mt-2 text-sm font-semibold text-slate-800">{goal.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeGoalItem(goal.id)}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      ลบเป้าหมาย
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <label className="mt-6 flex flex-col gap-2 text-sm font-bold text-slate-800">
          แผนภาพรวมของปีการศึกษานี้
          <textarea
            value={form.academicYearGoals}
            onChange={(e) => setForm((f) => ({ ...f, academicYearGoals: e.target.value }))}
            rows={4}
            placeholder="สรุปแนวทางการพัฒนาโดยรวม (ไม่บังคับ)"
            className="resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-normal leading-relaxed text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
          />
        </label>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
          >
            บันทึกข้อมูล
          </button>
          {saved ? (
            <span className="text-sm font-semibold text-emerald-600" role="status">
              บันทึกเรียบร้อยแล้ว
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}
