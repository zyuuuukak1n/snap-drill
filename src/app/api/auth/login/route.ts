import { NextRequest, NextResponse } from 'next/server';
import { findUserByEmail, verifyPassword, createSession } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';

const LoginSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '入力内容が正しくありません' },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password_hash, user.salt);
    if (!isValid) {
      return NextResponse.json(
        { error: 'メールアドレスまたはパスワードが正しくありません' },
        { status: 401 }
      );
    }

    const token = createSession(user.id);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json(
      { error: 'ログイン中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

