import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { signToken, authCookieHeader } from '@/utils/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ success: false, error: 'Missing fields' }, { status: 400 });

    const exists = await User.findOne({ email });
    if (exists) return NextResponse.json({ success: false, error: 'Email already used' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'user' });

    const token = signToken({ _id: user._id.toString(), email: user.email, role: user.role, name: user.name });
    return new NextResponse(JSON.stringify({ success: true, data: { name: user.name, email: user.email, role: user.role } }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...authCookieHeader(token) },
    });
  } catch (e:any) {
    return NextResponse.json({ success: false, error: e.message || 'Server error' }, { status: 500 });
  }
}
