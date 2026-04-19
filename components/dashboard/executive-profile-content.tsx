"use client";

import { UserCircle } from "lucide-react";
import { ProfileAvatarUploadSection } from "@/components/dashboard/profile-avatar-upload-section";

export function ExecutiveProfileContent() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-md">
            <UserCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">โปรไฟล์ผู้บริหาร</h1>
            <p className="text-sm text-slate-600">
              อัปโหลดรูปประจำตัว — แสดงในแถบด้านข้างและหน้านี้ทันทีหลังอัปโหลดสำเร็จ
            </p>
          </div>
        </div>
      </header>

      <div className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-lg backdrop-blur-md">
        <ProfileAvatarUploadSection variant="executive" />
      </div>
    </div>
  );
}
