import type { PortfolioItem, TeacherGoal } from "@/lib/teacher-storage";

const AXES = [
  "ด้านภาษา",
  "ด้าน IT / Digital Literacy",
  "การจัดการเรียนการสอน",
  "ทักษะวิชาชีพเฉพาะทาง",
  "นวัตกรรมและวิจัย",
  "ความปลอดภัยและอาชีพ",
] as const;

function keywordScore(text: string, keys: string[]): number {
  const t = text.toLowerCase();
  return keys.reduce((s, k) => (t.includes(k.toLowerCase()) ? s + 1 : s), 0);
}

/** คำนวณค่ากราฟเรดาร์จากเป้าหมายและพอร์ต (ไม่ใช้ตัวเลขจำลองคงที่) */
export function buildVocationalRadarData(
  goals: TeacherGoal[],
  portfolioItems: PortfolioItem[],
): { skill: string; value: number }[] {
  const axisKeys: Record<(typeof AXES)[number], string[]> = {
    "ด้านภาษา": ["ภาษา", "อังกฤษ", "ไทย", "การอ่าน", "การเขียน"],
    "ด้าน IT / Digital Literacy": ["it", "ดิจิทัล", "เทค", "สารสนเทศ", "ai", "คอม"],
    "การจัดการเรียนการสอน": ["สอน", "เรียนการสอน", "active", "ชั้นเรียน", "บรรยาย"],
    "ทักษะวิชาชีพเฉพาะทาง": ["วิชาชีพ", "วิชา", "สมรรถนะ", "อาชีวะ", "ฝึกปฏิบัติ"],
    "นวัตกรรมและวิจัย": ["วิจัย", "นวัตกรรม", "โครงงาน", "r&d"],
    "ความปลอดภัยและอาชีพ": ["ปลอดภัย", "อาชีพ", "จริยธรรม", "อาชีวอนามัย"],
  };

  const scores: Record<string, number> = {};
  for (const a of AXES) scores[a] = 0;

  for (const g of goals) {
    const blob = `${g.category} ${g.description}`;
    const prog = typeof g.progressPercent === "number" ? g.progressPercent : 50;
    for (const a of AXES) {
      const bump = keywordScore(blob, axisKeys[a]) * 8 + prog * 0.15;
      scores[a] += bump;
    }
  }
  for (const it of portfolioItems) {
    const blob = `${it.title} ${it.category} ${it.level}`;
    for (const a of AXES) {
      scores[a] += keywordScore(blob, axisKeys[a]) * 10 + 4;
    }
  }

  const raw = AXES.map((skill) => scores[skill] || 0);
  const max = Math.max(...raw, 1);
  return AXES.map((skill, i) => ({
    skill,
    value: Math.min(100, Math.round(38 + (raw[i]! / max) * 52)),
  }));
}
