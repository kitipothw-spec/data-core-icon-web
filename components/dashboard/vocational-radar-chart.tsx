"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const DEFAULT_VOCATIONAL_DATA = [
  { skill: "ด้านภาษา", value: 55 },
  { skill: "ด้าน IT / Digital Literacy", value: 55 },
  { skill: "การจัดการเรียนการสอน", value: 55 },
  { skill: "ทักษะวิชาชีพเฉพาะทาง", value: 55 },
  { skill: "นวัตกรรมและวิจัย", value: 55 },
  { skill: "ความปลอดภัยและอาชีพ", value: 55 },
];

type RadarDatum = { skill: string; value: number };

type VocationalRadarChartProps = {
  className?: string;
  /** ใช้ id แยก gradient เมื่อมีหลายกราฟในหน้าเดียวกัน */
  gradientId?: string;
  /** ถ้าไม่ส่ง จะใช้ค่าเริ่มต้นกลาง ๆ (ไม่ใช้ตัวเลขจำลองสูงสุดแบบเดิม) */
  data?: RadarDatum[];
};

export function VocationalRadarChart({
  className = "",
  gradientId = "vocRadarGradient",
  data,
}: VocationalRadarChartProps) {
  const chartData = data?.length ? data : DEFAULT_VOCATIONAL_DATA;
  return (
    <div className={`h-80 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={chartData}>
          <PolarGrid stroke="#cbd5e1" />
          <PolarAngleAxis
            dataKey="skill"
            tick={{ fill: "#1e293b", fontSize: 10 }}
          />
          <Radar
            name="ระดับทักษะ"
            dataKey="value"
            stroke="#ea580c"
            fill={`url(#${gradientId})`}
            fillOpacity={0.45}
          />
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#db2777" />
            </linearGradient>
          </defs>
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
