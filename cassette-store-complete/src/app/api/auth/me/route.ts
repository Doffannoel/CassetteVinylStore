import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

export async function GET(req: Request) {
  // ✅ TAMBAH INI - Debug cookie
  const allCookies = req.headers.get("cookie");
  // console.log('🍪 ALL COOKIES:', allCookies);
  
  const cookieHeader = req.headers.get("cookie") || "";
  const token = cookieHeader
    .split('; ')
    .find(row => row.startsWith('auth_token='))
    ?.split('=')[1];
  
  // console.log('🍪 TOKEN FOUND:', token ? token.substring(0, 20) + '...' : 'NONE');
  
  const user = verifyToken(token);
  // console.log('👤 USER:', user ? 'VALID' : 'INVALID');

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user });
}