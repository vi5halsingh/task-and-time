import type { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../lib/jwt.js';
import { getUserById } from '../services/auth.service.js';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in.',
        },
      });
      return;
    }

    let payload;
    try {
      payload = verifyAuthToken(token);
    } catch {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired session. Please log in again.',
        },
      });
      return;
    }

    // Verify user still exists in database
    const user = await getUserById(payload.userId);
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
