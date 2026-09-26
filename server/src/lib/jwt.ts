import jwt from 'jsonwebtoken';
import type { CookieOptions } from 'express';
import type { JwtPayload } from '../types/auth.types.js';

export const AUTH_COOKIE_NAME = 'auth_token';

const JWT_SECRET = process.env.JWT_SECRET || 'development_secret_key_suntek_2026_test_jwt';
const JWT_EXPIRES_IN = '7d';

export function signAuthToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyAuthToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function getAuthCookieOptions(): CookieOptions {
  const isProd =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_EXTERNAL_URL);

  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}
