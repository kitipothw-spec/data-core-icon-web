"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const vocationalData = [
  { skill: "ด้านภาษา", value: 78 },
  { skill: "ด้าน IT / Digital Literacy", value: 72 },
  { skill: "การจัดการเรียนการสอน", value: 85 },
  { skill: "ทักษะวิชาชีพเฉพาะทาง", value: 80 },
  { skill: "นวัตกรรมและวิจัย", value: 68 },
  { skill: "ความปลอดภัยและอาชีพ", value: 74 },
];

type VocationalRadarChartProps = {
  className?: string;
  /** ใช้ id แยก gradient เมื่อมีหลายกราฟในหน้าเดียวกัน */
  gradientId?: string;
};

export function VocationalRadarChart({
  className = "",
  gradientId = "vocRadarGradient",
}: VocationalRadarChartProps) {
  return (
    <div className={`h-80 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="72%" data={vocationalData}>
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
