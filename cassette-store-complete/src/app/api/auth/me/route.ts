import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";

export function GET(req: Request) {
  const token = req.headers.get("cookie")?.split("auth_token=")?.[1];
  const user = verifyToken(token);

  if (!user) {
    return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user });
}
