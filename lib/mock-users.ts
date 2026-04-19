export type MockUserRecord = {
  email: string;
  password: string;
  role: "admin" | "teacher" | "executive";
  name: string;
  department: string;
};

/** ฐานข้อมูลจำลองสำหรับทดสอบการเข้าสู่ระบบ */
export const MOCK_USERS: MockUserRecord[] = [
  {
    email: "admin@test.com",
    password: "password123",
    role: "admin",
    name: "ผู้ดูแลระบบ",
    department: "ศูนย์เทคโนโลยีสารสนเทศ",
  },
  {
    email: "teacher@test.com",
    password: "password123",
    role: "teacher",
    name: "ครูสมชาย",
    department: "คณิตศาสตร์",
  },
  {
    email: "boss@test.com",
    password: "password123",
    role: "executive",
    name: "ผู้บริหารทดสอบ",
    department: "สำนักงานเขตพื้นที่การศึกษา",
  },
];

export type AuthenticatedMockUser = Omit<MockUserRecord, "password">;

export function findMockUser(
  email: string,
  password: string,
): AuthenticatedMockUser | null {
  const normalized = email.trim().toLowerCase();
  const row = MOCK_USERS.find(
    (u) => u.email.toLowerCase() === normalized && u.password === password,
  );
  if (!row) return null;
  return {
    email: row.email,
    role: row.role,
    name: row.name,
    department: row.department,
  };
}
