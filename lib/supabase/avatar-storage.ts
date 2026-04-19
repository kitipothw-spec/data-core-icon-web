/** โฟลเดอร์แรกต้องเป็น auth.uid() ให้ตรงกับ storage policy ของ bucket avatars */
export const AVATARS_BUCKET = "avatars" as const;

/** เส้นทางอัปโหลด: {userId}/public/{timestamp}.png — ตรงกับที่ต้องการสำหรับ URL สาธารณะใต้ uid */
export function buildPublicAvatarObjectPath(userId: string): string {
  return `${userId}/public/${Date.now()}.png`;
}
