import { NextRequest } from 'next/server';
import { validateSession, DbUser } from './db';

export const SESSION_COOKIE_NAME = 'snap_drill_session';

export function getSessionUser(req: NextRequest): DbUser | null {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return validateSession(token);
}

