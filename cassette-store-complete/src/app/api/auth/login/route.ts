import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, authCookieHeader } from '@/utils/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, password } = await req.json();
    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });

    const token = signToken({ _id: user._id.toString(), email: user.email, role: user.role, name: user.name });
    
    // ✅ TAMBAH INI - Debug cookie
    console.log('🍪 TOKEN GENERATED:', token.substring(0, 20) + '...');
    console.log('🍪 COOKIE HEADER:', authCookieHeader(token));
    
    return new NextResponse(JSON.stringify({ success: true, data: { name: user.name, email: user.email, role: user.role } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...authCookieHeader(token) },
    });
  } catch (e:any) {
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}