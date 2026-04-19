"use client";

import { useMemo } from "react";
import Image from "next/image";
import { FileText, Printer } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useAppData } from "@/contexts/app-data-context";
import { computeGoalProgressList } from "@/lib/goal-progress";
import { VocationalRadarChart } from "@/components/dashboard/vocational-radar-chart";

const LEVEL_ORDER = ["ตนเอง", "ชุมชน", "สถานศึกษา", "จังหวัด", "ชาติ", "นานาชาติ"] as const;

function levelSortKey(level: string): number {
  const i = LEVEL_ORDER.indexOf(level as (typeof LEVEL_ORDER)[number]);
  return i === -1 ? 99 : i;
}

export function TeacherDevelopmentReportContent() {
  const { user } = useAuth();
  const { profile, portfolioItems } = useAppData();

  const displayName = profile?.displayName || user?.name || "ครูผู้ใช้";
  const dept = profile?.department || user?.department || "-";

  const goalProgressList = useMemo(
    () => computeGoalProgressList(profile.goals, portfolioItems),
    [portfolioItems, profile.goals],
  );

  const sortedItems = useMemo(
    () =>
      [...portfolioItems].sort((a, b) => {
        const d = levelSortKey(a.level) - levelSortKey(b.level);
        return d !== 0 ? d : a.date.localeCompare(b.date);
      }),
    [portfolioItems],
  );

  const itemsByLevel = useMemo(() => {
    const map = new Map<string, typeof portfolioItems>();
    for (const l of LEVEL_ORDER) {
      map.set(l, []);
    }
    const other: typeof portfolioItems = [];
    for (const item of portfolioItems) {
      if ((LEVEL_ORDER as readonly string[]).includes(item.level)) {
        map.get(item.level)!.push(item);
      } else {
        other.push(item);
      }
    }
    if (other.length > 0) {
      map.set("อื่น ๆ / ไม่ระบุระดับ", other);
    }
    return map;
  }, [portfolioItems]);

  const levelSections = useMemo(() => {
    const extra = itemsByLevel.get("อื่น ๆ / ไม่ระบุระดับ");
    return [
      ...LEVEL_ORDER.map((lv) => ({ label: lv, rows: itemsByLevel.get(lv) ?? [] })),
      ...(extra && extra.length > 0
        ? [{ label: "อื่น ๆ / ไม่ระบุระดับ" as const, rows: extra }]
        : []),
    ];
  }, [itemsByLevel]);

  return (
    <div className="print-root mx-auto max-w-6xl space-y-10">
      <div className="no-print">
        <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
          <h1 className="text-2xl font-bold text-slate-900">รายงานการพัฒนาตนเอง</h1>
          <p className="text-sm text-slate-600">
            สรุปเป้าหมาย ความคืบหน้า และพอร์ตโฟลิโอแยกตามระดับกิจกรรม — พิมพ์เป็น PDF ผ่านเมนูของเบราว์เซอร์
          </p>
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-4 inline-flex items-center gap-2 rounded-[24px] bg-gradient-to-r from-orange-400 to-pink-500 px-6 py-3 text-sm font-bold text-white shadow-md"
          >
            <Printer className="h-4 w-4" />
            พิมพ์รายงาน (PDF)
          </button>
        </header>
      </div>

      <div
        id="teacher-report-print"
        className="print-document space-y-8 rounded-[24px] border border-slate-200 bg-white p-8 shadow-sm print:border-0 print:shadow-none"
      >
        <div className="border-b-2 border-slate-900 pb-6 print:border-slate-900">
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-slate-700 print:text-black">
            รายงานสรุปผลการพัฒนาสมรรถนะครู (DATA-CORE-ICON)
          </p>
          <h2 className="mt-3 text-center text-2xl font-bold text-slate-900 print:text-black">
            {displayName}
          </h2>
          <p className="mt-1 text-center text-sm font-semibold text-slate-800 print:text-black">
            แผนกวิชา / กลุ่มสาระการเรียนรู้: {dept}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-800 print:text-black">
            <span className="font-semibold">เป้าหมายปีการศึกษา: </span>
            {profile?.academicYearGoals?.trim()
              ? profile.academicYearGoals
              : "— (บันทึกได้ที่เมนู ข้อมูลส่วนตัวและเป้าหมาย)"}
          </p>
          {profile ? (
            <p className="mt-2 text-sm text-slate-800 print:text-black">
              <span className="font-semibold">ดัชนีความสำเร็จตามเป้าหมายรวม: </span>
              {profile.goalAchievementPercent}%
            </p>
          ) : null}
        </div>

        <section>
          <h3 className="mb-3 text-lg font-bold text-slate-900 print:text-black">
            เป้าหมายและความคืบหน้า (%)
          </h3>
          <p className="mb-4 text-sm text-slate-600 print:text-slate-800">
            คำนวณจากจำนวนกิจกรรมที่เชื่อมกับแต่ละเป้าหมาย (สูงสุด 100%)
          </p>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 print:border-slate-900">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100 text-left print:bg-slate-200">
                  <th className="border border-slate-300 px-3 py-2 font-bold text-slate-900 print:border-slate-900 print:text-black">
                    เป้าหมาย
                  </th>
                  <th className="border border-slate-300 px-3 py-2 font-bold text-slate-900 print:border-slate-900 print:text-black">
                    รายละเอียด
                  </th>
                  <th className="border border-slate-300 px-3 py-2 font-bold text-slate-900 print:border-slate-900 print:text-black">
                    ความคืบหน้า
                  </th>
                </tr>
              </thead>
              <tbody>
                {goalProgressList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={3}
                      className="border border-slate-300 px-3 py-4 text-center text-slate-600 print:border-slate-900"
                    >
                      ยังไม่มีเป้าหมายที่บันทึก
                    </td>
                  </tr>
                ) : (
                  goalProgressList.map((g) => (
                    <tr key={g.id} className="print:text-black">
                      <td className="border border-slate-300 px-3 py-2 font-semibold print:border-slate-900">
                        {g.goal}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 print:border-slate-900">
                        {g.description}
                      </td>
                      <td className="border border-slate-300 px-3 py-2 font-bold print:border-slate-900">
                        {g.totalPercent}%
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h3 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900 print:text-black">
            <FileText className="no-print h-5 w-5 text-orange-500" />
            กราฟทักษะครูอาชีวะ
          </h3>
          <p className="mb-4 text-sm text-slate-600 print:text-slate-800">
            แสดงสมรรถนะหลัก 5–6 ด้านสำหรับครูอาชีวศึกษา (ข้อมูลจำลอง)
          </p>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 print:border-slate-300 print:bg-white">
            <VocationalRadarChart gradientId="vocPrintGradient" />
          </div>
        </section>

        <section>
          <h3 className="mb-3 text-lg font-bold text-slate-900 print:text-black">
            ตารางกิจกรรมตามระดับ (ตนเอง → นานาชาติ)
          </h3>
          <p className="mb-4 text-sm text-slate-600 print:text-slate-800">
            จัดกลุ่มตามระดับกิจกรรม: ระดับบุคคล (ตนเอง) ไปจนถึงระดับนานาชาติ
          </p>
          <div className="space-y-8">
            {levelSections.map(({ label, rows }) => {
              return (
                <div key={label} className="overflow-x-auto">
                  <p className="mb-2 text-sm font-bold text-slate-900 print:text-black">
                    ระดับ: {label} ({rows.length} รายการ)
                  </p>
                  <table className="w-full min-w-[640px] border-collapse border border-slate-200 text-sm print:border-slate-900">
                    <thead>
                      <tr className="bg-slate-100 text-left print:bg-slate-200">
                        <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-900 print:text-black">
                          ลำดับ
                        </th>
                        <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-900 print:text-black">
                          ชื่อกิจกรรม
                        </th>
                        <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-900 print:text-black">
                          หมวดหมู่
                        </th>
                        <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-900 print:text-black">
                          วันที่
                        </th>
                        <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-900 print:text-black">
                          เป้าหมายที่เกี่ยวข้อง
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="border border-slate-200 px-3 py-3 text-center text-slate-500 print:border-slate-900"
                          >
                            ไม่มีกิจกรรมในระดับนี้
                          </td>
                        </tr>
                      ) : (
                        rows.map((row, i) => (
                          <tr key={row.id} className="print:text-black">
                            <td className="border border-slate-200 px-3 py-2 print:border-slate-900">
                              {i + 1}
                            </td>
                            <td className="border border-slate-200 px-3 py-2 font-medium print:border-slate-900">
                              {row.title}
                            </td>
                            <td className="border border-slate-200 px-3 py-2 print:border-slate-900">
                              {row.category}
                            </td>
                            <td className="border border-slate-200 px-3 py-2 print:border-slate-900">
                              {row.date}
                            </td>
                            <td className="border border-slate-200 px-3 py-2 print:border-slate-900">
                              {row.relatedGoal || "ไม่ระบุ"} · +{row.goalContributionPercent}%
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h3 className="mb-4 text-lg font-bold text-slate-900 print:text-black">
            รายการพอร์ตโฟลิโอทั้งหมด (เรียงตามระดับกิจกรรม)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse border border-slate-200 text-sm print:border-slate-800">
              <thead>
                <tr className="bg-slate-100 text-left print:bg-slate-200">
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    ลำดับ
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    ชื่อกิจกรรม
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    หมวดหมู่
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    ระดับ
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    วันที่
                  </th>
                  <th className="border border-slate-200 px-3 py-2 font-bold text-slate-800 print:border-slate-800 print:text-black">
                    เป้าหมายที่เกี่ยวข้อง
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="border border-slate-200 px-3 py-6 text-center text-slate-500 print:border-slate-800"
                    >
                      ยังไม่มีรายการ — เพิ่มได้จากแดชบอร์ดหลัก
                    </td>
                  </tr>
                ) : (
                  sortedItems.map((row, i) => (
                    <tr key={row.id} className="print:text-black">
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {i + 1}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 font-medium print:border-slate-800">
                        {row.title}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {row.category}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {row.level}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        {row.date}
                      </td>
                      <td className="border border-slate-200 px-3 py-2 print:border-slate-800">
                        <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white print:bg-transparent print:text-black print:p-0">
                          {row.relatedGoal || "ไม่ระบุเป้าหมาย"} · +{row.goalContributionPercent}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-4 text-xs text-slate-500 print:border-slate-300 print:text-slate-700">
          <p className="text-center font-semibold print:text-black">
            เอกสารนี้จัดทำจากระบบ DATA-CORE-ICON เพื่อการรายงานการพัฒนาสมรรถนะครู
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 print:hidden">
            <div className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=64&q=80"
                alt=""
                fill
                className="object-cover"
                sizes="32px"
              />
            </div>
            <span>ลายเซ็นผู้รายงาน (สาธิต)</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
