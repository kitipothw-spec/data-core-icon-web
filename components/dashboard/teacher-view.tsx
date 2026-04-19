"use client";

import { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Camera,
  FileText,
  LayoutDashboard,
  Pencil,
  Printer,
  Target,
  Timer,
  Trash2,
} from "lucide-react";
import { useAppData } from "@/contexts/app-data-context";
import { computeGoalProgressList } from "@/lib/goal-progress";
import type { PortfolioItem } from "@/lib/teacher-storage";
import { useAuth } from "@/contexts/auth-context";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { supabase } from "@/lib/supabase";

const categories = [
  "การพัฒนาวิชาชีพ",
  "เทคโนโลยีสารสนเทศ",
  "การวิจัยในชั้นเรียน",
  "การวัดและประเมินผล",
  "ภาวะผู้นำทางวิชาการ",
];

const levels = ["ตนเอง", "ชุมชน", "สถานศึกษา", "จังหวัด", "ชาติ", "นานาชาติ"];

const COURSE_ACCENTS = [
  "from-amber-400 to-orange-500",
  "from-fuchsia-500 to-pink-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-400 to-teal-500",
  "from-violet-500 to-purple-600",
  "from-rose-400 to-orange-400",
] as const;

const GOAL_BADGE_STYLES: Record<string, string> = {
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

type TeacherViewProps = {
  teacherName?: string;
};

export function TeacherView({ teacherName = "ครูสมชาย" }: TeacherViewProps) {
  const { user } = useAuth();
  const {
    profile,
    portfolioItems,
    refreshTeacherData,
    addPortfolioItem: ctxAddPortfolio,
    updatePortfolioItem: ctxUpdatePortfolio,
    deletePortfolioItem: ctxDeletePortfolio,
    dataReady,
  } = useAppData();
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState(levels[0]);
  const [date, setDate] = useState("");
  const [relatedGoal, setRelatedGoal] = useState("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const [teachingHours, setTeachingHours] = useState(18);
  const [supportHours, setSupportHours] = useState(10);
  const [courseCards, setCourseCards] = useState<
    { id: string; title: string; topic: string; accent: string }[]
  >([]);
  const workloadTotal = teachingHours + supportHours;
  const workloadPercent = Math.min(100, Math.round((workloadTotal / 40) * 100));
  const overload = workloadPercent > 85;

  useEffect(() => {
    function refreshData() {
      startTransition(() => {
        refreshTeacherData();
      });
    }
    refreshData();
    window.addEventListener("focus", refreshData);
    return () => window.removeEventListener("focus", refreshData);
  }, [refreshTeacherData]);

  useEffect(() => {
    if (!dataReady) return;
    setRelatedGoal((prev) =>
      prev ? prev : profile.goals.length > 0 ? profile.goals[0].id : "",
    );
  }, [dataReady, profile.goals]);

  const goalProgressList = useMemo(
    () => computeGoalProgressList(profile.goals, portfolioItems),
    [portfolioItems, profile.goals],
  );

  const goalLookup = useMemo(
    () => new Map(profile.goals.map((goal) => [goal.id, goal])),
    [profile.goals],
  );

  const digitalBadges = useMemo(() => {
    const styles = [
      "from-violet-500 to-blue-500",
      "from-pink-500 to-rose-500",
      "from-emerald-500 to-teal-500",
      "from-amber-500 to-orange-500",
      "from-cyan-500 to-sky-500",
    ];
    return profile.goals.slice(0, 5).map((g, i) => ({
      name: (g.category || "เป้าหมาย").slice(0, 32),
      style: styles[i % styles.length]!,
    }));
  }, [profile.goals]);

  const loadCourseCards = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, category, cover_url")
        .order("created_at", { ascending: false })
        .limit(12);
      if (error) throw error;
      const rows = (data ?? []) as { id: string; title: string; category: string; cover_url: string }[];
      setCourseCards(
        rows.map((r, i) => ({
          id: r.id,
          title: r.title,
          topic: r.category || "หลักสูตร",
          accent: COURSE_ACCENTS[i % COURSE_ACCENTS.length]!,
        })),
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
    }
  }, []);

  useEffect(() => {
    void loadCourseCards();
  }, [loadCourseCards]);

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) return;
    (async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("workload_hours")
          .eq("id", user.id)
          .maybeSingle();
        if (error) throw error;
        const w = Number(data?.workload_hours ?? 28) || 28;
        setTeachingHours(Math.max(0, Math.round(w * 0.58)));
        setSupportHours(Math.max(0, Math.round(w * 0.42)));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        alert("เกิดข้อผิดพลาด: " + msg);
      }
    })();
  }, [user?.id]);

  async function handleSubmitPortfolio(e: React.FormEvent) {
    e.preventDefault();
    if (!activityName.trim() || !date || !relatedGoal) {
      setSaveHint("กรุณากรอกชื่อกิจกรรม วันที่ และเป้าหมายที่เกี่ยวข้อง");
      return;
    }
    const payload = {
      title: activityName.trim(),
      category,
      level,
      date,
      relatedGoal,
      goalContributionPercent: 25,
    };
    const wasEditing = Boolean(editingItemId);
    try {
      if (editingItemId) {
        await ctxUpdatePortfolio(editingItemId, payload);
      } else {
        await ctxAddPortfolio(payload);
      }
      setEditingItemId(null);
      setActivityName("");
      setDate("");
      setSaveHint(
        wasEditing
          ? "บันทึกการแก้ไขเรียบร้อยแล้ว"
          : "บันทึกลงพอร์ตโฟลิโอแล้ว — ดูได้ที่เมนู รายงานการพัฒนาตนเอง",
      );
      window.setTimeout(() => setSaveHint(null), 4000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
      setSaveHint("ไม่สามารถบันทึกได้ — ตรวจสอบการเชื่อมต่อหรือสิทธิ์ Supabase");
      window.setTimeout(() => setSaveHint(null), 5000);
    }
  }

  function handleEditPortfolio(item: PortfolioItem) {
    setEditingItemId(item.id);
    setActivityName(item.title);
    setCategory(item.category);
    setLevel(item.level);
    setDate(item.date);
    const matchedGoal = profile.goals.find(
      (goal) => goal.id === item.relatedGoal || goal.category === item.relatedGoal,
    );
    setRelatedGoal(matchedGoal?.id ?? "");
    setSaveHint("กำลังแก้ไขรายการผลงาน");
  }

  async function handleDeletePortfolio(id: string) {
    try {
      await ctxDeletePortfolio(id);
      if (editingItemId === id) {
        setEditingItemId(null);
        setActivityName("");
        setDate("");
      }
      setSaveHint("ลบรายการผลงานเรียบร้อยแล้ว");
      window.setTimeout(() => setSaveHint(null), 3000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      alert("เกิดข้อผิดพลาด: " + msg);
      setSaveHint("ลบไม่สำเร็จ — ลองใหม่อีกครั้ง");
      window.setTimeout(() => setSaveHint(null), 4000);
    }
  }

  function goalProgressColor(percent: number) {
    if (percent >= 90) return "from-emerald-500 to-green-500";
    if (percent >= 70) return "from-lime-500 to-emerald-500";
    if (percent >= 40) return "from-amber-400 to-orange-500";
    return "from-yellow-300 to-amber-500";
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="flex flex-col gap-6 rounded-[24px] border border-white/70 bg-white/60 p-6 shadow-lg shadow-orange-500/5 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-orange-200/80 ring-offset-2 ring-offset-[#F8FAFC]">
            <Image
              src={
                user?.profileImage ||
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
              }
              alt={`รูปโปรไฟล์${teacherName}`}
              fill
              className="object-cover"
              sizes="64px"
              priority
            />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">ยินดีต้อนรับ</p>
            <h1 className="text-2xl font-bold text-slate-900">ยินดีต้อนรับ, {teacherName}</h1>
            <p className="text-sm text-slate-600">บันทึกพัฒนาการและพอร์ตโฟลิโอของคุณได้ที่นี่</p>
          </div>
        </div>
        <div className="rounded-[20px] bg-gradient-to-r from-orange-400 to-pink-500 px-5 py-3 text-center text-sm font-bold text-white shadow-md">
          บทบาท: ครูผู้สอน
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <Link
          href="/dashboard/teacher/profile"
          className="group flex flex-col justify-between rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md transition hover:ring-2 hover:ring-orange-300"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-orange-400 to-pink-500 text-white shadow-md">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">ข้อมูลส่วนตัวและเป้าหมาย</h2>
              <p className="mt-1 text-sm text-slate-600">
                แก้ไขชื่อ แผนกวิชา เป้าหมายปีการศึกษา และดูตัวชี้วัดเปรียบเทียบความสำเร็จ
              </p>
            </div>
          </div>
          <span className="mt-4 text-sm font-bold text-orange-600 group-hover:underline">
            ไปที่หน้านี้ →
          </span>
        </Link>

        <Link
          href="/dashboard/teacher/report"
          className="group flex flex-col justify-between rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md transition hover:ring-2 hover:ring-pink-300"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-900 text-white shadow-md">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">รายงานการพัฒนาตนเอง</h2>
              <p className="mt-1 text-sm text-slate-600">
                สรุปพอร์ตทั้งหมด กราฟทักษะครูอาชีวะ และพิมพ์รายงาน PDF
              </p>
            </div>
          </div>
          <span className="mt-4 text-sm font-bold text-pink-600 group-hover:underline">
            ไปที่หน้านี้ →
          </span>
        </Link>

        <Link
          href="/dashboard/teacher/report"
          className="group flex flex-col justify-between rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md transition hover:ring-2 hover:ring-indigo-300"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md">
              <Printer className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">พิมพ์รายงานการพัฒนาตนเอง</h2>
              <p className="mt-1 text-sm text-slate-600">
                เปิดหน้ารายงานฉบับเต็ม พร้อมหัวกระดาษ A4 และตารางแยกตามระดับกิจกรรม
              </p>
            </div>
          </div>
          <span className="mt-4 text-sm font-bold text-indigo-600 group-hover:underline">
            พิมพ์ / บันทึก PDF →
          </span>
        </Link>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">ภาระงาน</h2>
          <Timer className="h-5 w-5 text-orange-500" aria-hidden />
        </div>
        <div className="grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <p className="rounded-2xl bg-slate-50 px-4 py-3">
            ชั่วโมงสอน: <span className="font-bold">{teachingHours} ชั่วโมง/สัปดาห์</span>
          </p>
          <p className="rounded-2xl bg-slate-50 px-4 py-3">
            งานสนับสนุน: <span className="font-bold">{supportHours} ชั่วโมง/สัปดาห์</span>
          </p>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
            <span>ระดับภาระงานรวม</span>
            <span>
              {workloadTotal} / 40 ชั่วโมง ({workloadPercent}%)
            </span>
          </div>
          <div className="relative h-4 overflow-hidden rounded-full bg-slate-200">
            <div className="absolute inset-y-0 left-0 w-[70%] bg-emerald-400/70" />
            <div className="absolute inset-y-0 left-[70%] w-[15%] bg-amber-400/70" />
            <div className="absolute inset-y-0 left-[85%] w-[15%] bg-rose-400/70" />
            <div
              className={`absolute inset-y-0 left-0 rounded-full ${
                overload
                  ? "bg-gradient-to-r from-rose-500 to-pink-500"
                  : "bg-gradient-to-r from-emerald-500 to-teal-500"
              }`}
              style={{ width: `${workloadPercent}%` }}
            />
          </div>
          <p className="mt-2 text-xs font-semibold text-slate-600">
            โซนปลอดภัย 0-70% · โซนเฝ้าระวัง 71-85% · โซนเสี่ยงเกินภาระ 86-100%
          </p>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">ความคืบหน้าตามเป้าหมาย</h2>
          <BookOpen className="h-5 w-5 text-orange-500" aria-hidden />
        </div>
        <p className="text-sm text-slate-600">
          คำนวณอัตโนมัติจากกิจกรรมที่เชื่อมกับเป้าหมายรายข้อในเมนู &quot;ข้อมูลส่วนตัวและเป้าหมาย&quot;
        </p>
        <div className="mt-6 grid gap-4">
          {goalProgressList.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              ยังไม่มีเป้าหมายที่เลือกไว้ กรุณาเพิ่มหมวดหมู่เป้าหมายก่อน
            </p>
          ) : (
            goalProgressList.map((goalItem) => (
              <article
                key={goalItem.id}
                className="rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-md backdrop-blur-md"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <span
                    className={`rounded-full bg-gradient-to-r px-3 py-1.5 text-xs font-bold shadow-sm ${
                      GOAL_BADGE_STYLES[goalItem.goal] ?? "from-slate-500 to-slate-700 text-white"
                    }`}
                  >
                    {goalItem.goal}
                  </span>
                  <span className="text-sm font-bold text-slate-700">
                    ความคืบหน้า: {goalItem.totalPercent}%
                  </span>
                </div>
                <p className="mb-4 text-sm leading-relaxed text-slate-700">
                  รายละเอียดเป้าหมาย: {goalItem.description}
                </p>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${goalProgressColor(goalItem.totalPercent)} shadow-inner transition-[width]`}
                    style={{ width: `${goalItem.totalPercent}%` }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">
                  {goalItem.linkedCount} กิจกรรมที่เกี่ยวข้อง
                </p>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">เพิ่มพอร์ตโฟลิโอ / อัปเดตแผนพัฒนา</h2>
        <p className="mt-1 text-sm text-slate-600">
          กรอกข้อมูลกิจกรรมหรือการอบรม แล้วเลือกเป้าหมายที่เกี่ยวข้องเพื่อบันทึกความคืบหน้า
        </p>
        <form onSubmit={handleSubmitPortfolio} className="mt-6 grid gap-5 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
            ชื่อกิจกรรม/การอบรม
            <input
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="เช่น อบรมเชิงปฏิบัติการจัดการเรียนรู้แบบร่วมมือ"
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-normal text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            หมวดหมู่
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-normal text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            ระดับกิจกรรม
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-normal text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
            >
              {levels.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800 md:col-span-2">
            วันที่
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-normal text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            เป้าหมายที่เกี่ยวข้อง
            <select
              value={relatedGoal}
              onChange={(e) => setRelatedGoal(e.target.value)}
              className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm font-normal text-slate-900 outline-none ring-orange-400/30 focus:ring-4"
            >
              {profile.goals.length === 0 ? (
                <option value="">ยังไม่มีเป้าหมาย กรุณาเพิ่มในหน้าโปรไฟล์</option>
              ) : null}
              {profile.goals.map((goal) => (
                <option key={goal.id} value={goal.id}>
                  {goal.category}: {goal.description}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-3 md:col-span-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <Camera className="h-4 w-4 text-orange-500" />
              อัปโหลดรูปภาพ
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              <FileText className="h-4 w-4 text-pink-500" />
              อัปโหลดใบประกาศ
            </button>
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              className="rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
            >
              {editingItemId ? "บันทึกการแก้ไข" : "บันทึกลงพอร์ตโฟลิโอ"}
            </button>
            {editingItemId ? (
              <button
                type="button"
                onClick={() => {
                  setEditingItemId(null);
                  setActivityName("");
                  setDate("");
                  setSaveHint(null);
                }}
                className="ml-3 rounded-[24px] border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700"
              >
                ยกเลิกการแก้ไข
              </button>
            ) : null}
            {saveHint ? (
              <p className="mt-3 text-sm font-semibold text-emerald-600" role="status">
                {saveHint}
              </p>
            ) : null}
          </div>
        </form>

        <div className="mt-8 rounded-[24px] border border-white/80 bg-white/80 p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Award className="h-5 w-5 text-violet-500" />
            <h3 className="text-base font-bold text-slate-900">เหรียญตราดิจิทัล</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {digitalBadges.length === 0 ? (
              <p className="text-xs font-medium text-slate-500">บันทึกเป้าหมายในหน้าโปรไฟล์เพื่อแสดงแบดจ์ที่เกี่ยวข้อง</p>
            ) : (
              digitalBadges.map((badge, i) => (
                <span
                  key={`${badge.name}-${i}`}
                  className={`rounded-full bg-gradient-to-r ${badge.style} px-3 py-1.5 text-xs font-bold text-white shadow-sm`}
                >
                  {badge.name}
                </span>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">ประวัติกิจกรรมล่าสุด</h2>
        <p className="mt-1 text-sm text-slate-600">
          สามารถแก้ไขหรือลบรายการได้ และระบบจะคำนวณความคืบหน้าเป้าหมายใหม่ให้อัตโนมัติ
        </p>
        <div className="mt-5 grid gap-4">
          {portfolioItems.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              ยังไม่มีกิจกรรมที่บันทึกไว้
            </p>
          ) : (
            portfolioItems.slice(0, 6).map((item) => {
              const matchedGoal = goalLookup.get(item.relatedGoal);
              const goalLabel = matchedGoal
                ? `${matchedGoal.category}: ${matchedGoal.description}`
                : item.relatedGoal || "ไม่ระบุเป้าหมาย";
              return (
                <article
                  key={item.id}
                  className="rounded-2xl border border-white/80 bg-white/90 p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                      <p className="text-xs text-slate-600">
                        {item.category} · {item.level} · {item.date}
                      </p>
                    </div>
                    <span className="rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 px-3 py-1 text-xs font-bold text-white">
                      {goalLabel} · +25%
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditPortfolio(item)}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      แก้ไข
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePortfolio(item.id)}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      ลบ
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">หลักสูตรแนะนำโดย AI</h2>
            <p className="text-sm text-slate-600">คัดเลือกให้ตรงกับช่องว่างสมรรถนะของคุณ</p>
          </div>
        </div>
        {courseCards.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-6 text-center text-sm text-slate-600">
            ยังไม่มีหลักสูตรในระบบ — แอดมินสามารถเพิ่มได้ที่เมนู &quot;จัดการหลักสูตร&quot;
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courseCards.map((c) => (
              <article
                key={c.id}
                className="overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-md backdrop-blur-md"
              >
                <div className={`relative aspect-[4/5] bg-gradient-to-br ${c.accent}`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
                  <p className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white drop-shadow">
                    {c.title}
                  </p>
                </div>
                <div className="space-y-3 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{c.topic}</p>
                  <p className="rounded-xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                    {c.title.includes("AI")
                      ? "ตรงกับความสนใจด้าน AI ของคุณ"
                      : (goalProgressList[0]?.totalPercent ?? 0) < 65
                        ? "แนะนำเพื่อเร่งเป้าหมายที่ยังไม่ถึงเกณฑ์"
                        : workloadPercent < 75
                          ? "แนะนำเพราะคุณมีเวลาว่างช่วงปิดเทอม"
                          : "แนะนำแบบกระชับให้เหมาะกับภาระงานปัจจุบัน"}
                  </p>
                  <button
                    type="button"
                    className="w-full rounded-2xl bg-slate-900 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                  >
                    เริ่มเรียน
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
