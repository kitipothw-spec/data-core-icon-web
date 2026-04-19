import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/contexts/auth-context";

const TEST_ACCOUNTS: Array<{ email: string; password: string; role: UserRole }> = [
  { email: "admin@test.com", password: "password123", role: "admin" },
  { email: "teacher@test.com", password: "password123", role: "teacher" },
  { email: "boss@test.com", password: "password123", role: "executive" },
];

/**
 * สร้างบัญชีทดสอบ 3 ระดับ: signUp แล้ว upsert `profiles`
 * (admin@test.com, teacher@test.com, boss@test.com / password123)
 *
 * หมายเหตุ: ถ้า Auth เปิด “ยืนยันอีเมล” signUp อาจไม่คืน session/user — ควรปิดชั่วคราวหรือยืนยันในแดชบอร์ด Supabase
 */
export async function setupTestAccounts(supabase: SupabaseClient): Promise<void> {
  const errors: string[] = [];

  for (const acc of TEST_ACCOUNTS) {
    const fullName = `${acc.role.toUpperCase()} User`;
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
      options: {
        data: { role: acc.role, full_name: fullName },
      },
    });

    if (signUpError) {
      const msg = signUpError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered")) {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email: acc.email,
          password: acc.password,
        });
        if (signInErr) {
          errors.push(`${acc.email}: ${signInErr.message}`);
          continue;
        }
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const { error: upErr } = await supabase.from("profiles").upsert(
            {
              id: user.id,
              email: user.email ?? acc.email,
              full_name: fullName,
              role: acc.role,
              department: "",
            },
            { onConflict: "id" },
          );
          if (upErr) errors.push(`${acc.email} profile: ${upErr.message}`);
        }
        await supabase.auth.signOut();
        continue;
      }
      errors.push(`${acc.email}: ${signUpError.message}`);
      continue;
    }

    const user = signUpData.user;
    if (!user) {
      errors.push(
        `${acc.email}: signUp สำเร็จแต่ไม่มีข้อมูลผู้ใช้ (มักเกิดเมื่อเปิดยืนยันอีเมล) — ตรวจการตั้งค่า Authentication ใน Supabase`,
      );
      await supabase.auth.signOut();
      continue;
    }

    const { error: upErr } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        email: user.email ?? acc.email,
        full_name: fullName,
        role: acc.role,
        department: "",
      },
      { onConflict: "id" },
    );
    if (upErr) errors.push(`${acc.email} profile: ${upErr.message}`);

    await supabase.auth.signOut();
  }

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}
