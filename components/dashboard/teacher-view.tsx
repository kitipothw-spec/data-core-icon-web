"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Award,
  BookOpen,
  Camera,
  FileText,
  LayoutDashboard,
  Target,
  Timer,
} from "lucide-react";
import {
  addPortfolioItem,
  loadPortfolioItems,
  loadTeacherProfile,
  type PortfolioItem,
  type TeacherProfileState,
} from "@/lib/teacher-storage";

const categories = [
  "การพัฒนาวิชาชีพ",
  "เทคโนโลยีสารสนเทศ",
  "การวิจัยในชั้นเรียน",
  "การวัดและประเมินผล",
  "ภาวะผู้นำทางวิชาการ",
];

const levels = ["ตนเอง", "ชุมชน", "สถานศึกษา", "จังหวัด", "ชาติ", "นานาชาติ"];

const courses = [
  {
    title: "การออกแบบการเรียนรู้แบบโครงงาน",
    topic: "หลักสูตรและการสอน",
    accent: "from-amber-400 to-orange-500",
  },
  {
    title: "การใช้ AI ช่วยสร้างสื่อการสอน",
    topic: "เทคโนโลยีการศึกษา",
    accent: "from-fuchsia-500 to-pink-500",
  },
  {
    title: "การประเมินสมรรถนะผู้เรียน",
    topic: "การวัดและประเมินผล",
    accent: "from-sky-400 to-indigo-500",
  },
];

const digitalBadges = [
  { name: "Master of AI", style: "from-violet-500 to-blue-500" },
  { name: "Innovator", style: "from-pink-500 to-rose-500" },
  { name: "Coaching Mentor", style: "from-emerald-500 to-teal-500" },
];

type TeacherViewProps = {
  teacherName?: string;
};

export function TeacherView({ teacherName = "ครูสมชาย" }: TeacherViewProps) {
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState(levels[0]);
  const [date, setDate] = useState("");
  const [profile, setProfile] = useState<TeacherProfileState>(loadTeacherProfile);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [relatedGoal, setRelatedGoal] = useState("");
  const [goalContributionPercent, setGoalContributionPercent] = useState(0);
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const teachingHours = 18;
  const supportHours = 10;
  const workloadTotal = teachingHours + supportHours;
  const workloadPercent = Math.min(100, Math.round((workloadTotal / 40) * 100));
  const overload = workloadPercent > 85;

  useEffect(() => {
    function refreshData() {
      startTransition(() => {
        const loadedProfile = loadTeacherProfile();
        setProfile(loadedProfile);
        setPortfolioItems(loadPortfolioItems());
        setRelatedGoal((prev) =>
          prev
            ? prev
            : loadedProfile.goalCategories.length > 0
              ? loadedProfile.goalCategories[0]
              : "",
        );
      });
    }
    refreshData();
    window.addEventListener("focus", refreshData);
    return () => window.removeEventListener("focus", refreshData);
  }, []);

  const goalProgressList = useMemo(() => {
    const selectedGoals = profile.goalCategories;
    if (selectedGoals.length === 0) return [];
    return selectedGoals.map((goal) => {
      const total = portfolioItems
        .filter((item) => item.relatedGoal === goal)
        .reduce((sum, item) => sum + item.goalContributionPercent, 0);
      return {
        goal,
        totalPercent: Math.min(100, total),
      };
    });
  }, [portfolioItems, profile.goalCategories]);

  function handleAddPortfolio(e: React.FormEvent) {
    e.preventDefault();
    if (!activityName.trim() || !date || !relatedGoal) {
      setSaveHint("กรุณากรอกชื่อกิจกรรม วันที่ และเป้าหมายที่เกี่ยวข้อง");
      return;
    }
    const updatedItems = addPortfolioItem({
      title: activityName.trim(),
      category,
      level,
      date,
      relatedGoal,
      goalContributionPercent,
    });
    setPortfolioItems(updatedItems);
    setActivityName("");
    setDate("");
    setGoalContributionPercent(0);
    setSaveHint("บันทึกลงพอร์ตโฟลิโอแล้ว — ดูได้ที่เมนู รายงานการพัฒนาตนเอง");
    window.setTimeout(() => setSaveHint(null), 4000);
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
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80"
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

      <section className="grid gap-6 lg:grid-cols-2">
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
          คำนวณอัตโนมัติจากกิจกรรมที่เชื่อมกับเป้าหมายในเมนู &quot;ข้อมูลส่วนตัวและเป้าหมาย&quot;
        </p>
        <div className="mt-6 space-y-4">
          {goalProgressList.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              ยังไม่มีเป้าหมายที่เลือกไว้ กรุณาเพิ่มหมวดหมู่เป้าหมายก่อน
            </p>
          ) : (
            goalProgressList.map((goalItem) => (
              <div key={goalItem.goal}>
                <div className="mb-2 flex justify-between text-sm font-semibold text-slate-700">
                  <span>{goalItem.goal}</span>
                  <span>{goalItem.totalPercent}%</span>
                </div>
                <div className="h-4 w-full overflow-hidden rounded-full bg-slate-200/80">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${goalProgressColor(goalItem.totalPercent)} shadow-inner transition-[width]`}
                    style={{ width: `${goalItem.totalPercent}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">เพิ่มพอร์ตโฟลิโอ / อัปเดตแผนพัฒนา</h2>
        <p className="mt-1 text-sm text-slate-600">
          กรอกข้อมูลกิจกรรมหรือการอบรมแล้วกดบันทึกลงพอร์ต — รายการจะแสดงในรายงานการพัฒนาตนเอง
        </p>
        <form onSubmit={handleAddPortfolio} className="mt-6 grid gap-5 md:grid-cols-2">
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
              {profile.goalCategories.length === 0 ? (
                <option value="">ยังไม่มีเป้าหมาย กรุณาเพิ่มในหน้าโปรไฟล์</option>
              ) : null}
              {profile.goalCategories.map((goal) => (
                <option key={goal} value={goal}>
                  {goal}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-slate-800">
            ความสำเร็จที่เพิ่มขึ้น (%)
            <input
              type="range"
              min={0}
              max={100}
              value={goalContributionPercent}
              onChange={(e) => setGoalContributionPercent(Number(e.target.value))}
              className="h-2 cursor-pointer accent-orange-500"
              aria-label="ความสำเร็จที่เพิ่มขึ้น"
            />
            <span className="text-xs font-bold text-slate-600">{goalContributionPercent}%</span>
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
              บันทึกลงพอร์ตโฟลิโอ
            </button>
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
            {digitalBadges.map((badge) => (
              <span
                key={badge.name}
                className={`rounded-full bg-gradient-to-r ${badge.style} px-3 py-1.5 text-xs font-bold text-white shadow-sm`}
              >
                {badge.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <h2 className="text-lg font-bold text-slate-900">ประวัติกิจกรรมล่าสุด</h2>
        <p className="mt-1 text-sm text-slate-600">
          แต่ละกิจกรรมจะแสดงเป้าหมายที่เกี่ยวข้องและเปอร์เซ็นต์ที่ช่วยเพิ่มความสำเร็จ
        </p>
        <div className="mt-5 grid gap-4">
          {portfolioItems.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              ยังไม่มีกิจกรรมที่บันทึกไว้
            </p>
          ) : (
            portfolioItems.slice(0, 6).map((item) => (
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
                    {item.relatedGoal || "ไม่ระบุเป้าหมาย"} · +{item.goalContributionPercent}%
                  </span>
                </div>
              </article>
            ))
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <article
              key={c.title}
              className="overflow-hidden rounded-[24px] border border-white/70 bg-white/80 shadow-md backdrop-blur-md"
            >
              <div className={`relative aspect-[4/5] bg-gradient-to-br ${c.accent}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
                <p className="absolute bottom-3 left-3 right-3 text-sm font-bold text-white drop-shadow">
                  {c.title}
                </p>
              </div>
              <div className="space-y-3 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {c.topic}
                </p>
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
      </section>
    </div>
  );
}
