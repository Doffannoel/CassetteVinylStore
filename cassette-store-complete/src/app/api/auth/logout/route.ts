import { NextResponse } from "next/server";
import { clearAuthCookieHeader } from "@/utils/auth";

export function POST() {
  return new NextResponse(
    JSON.stringify({ success: true }),
    {
      status: 200,
      headers: clearAuthCookieHeader(),
    }
  );
}
