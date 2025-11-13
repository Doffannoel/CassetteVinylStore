import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export type JWTPayload = { _id: string; email: string; role: 'user'|'admin'; name: string };

export function signToken(payload: JWTPayload) {
  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN 
  } as jwt.SignOptions);
}
export function verifyToken<T=JWTPayload>(token?: string): T | null {
  try {
    if (!token) return null;
    return jwt.verify(token, JWT_SECRET) as T;
  } catch {
    return null;
  }
}

export function authCookieHeader(token: string) {
  return {
    'Set-Cookie': cookie.serialize('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7d
    }),
  };
}

export function clearAuthCookieHeader() {
  return {
    'Set-Cookie': cookie.serialize('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }),
  };
}
