import { NextResponse } from 'next/server';
import { clearAuthCookieHeader } from '@/utils/auth';

export async function POST() {
  return new NextResponse(
    JSON.stringify({ success: true, message: 'Logged out successfully' }), 
    {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...clearAuthCookieHeader() 
      }
    }
  );
}