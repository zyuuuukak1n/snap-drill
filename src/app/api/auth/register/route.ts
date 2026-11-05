import { NextRequest, NextResponse } from 'next/server';
import { createUser, findUserByEmail, createSession } from '@/lib/db';
import { SESSION_COOKIE_NAME } from '@/lib/auth';
import { z } from 'zod';

const RegisterSchema = z.object({
  email: z.string().email('正しいメールアドレスを入力してください'),
  password: z.string().min(4, 'パスワードは4文字以上で入力してください'),
  name: z.string().min(1, 'おなまえを入力してください'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || '入力内容が正しくありません' },
        { status: 400 }
      );
    }

    const { email, password, name } = parsed.data;

    // Check existing
    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    const user = createUser(email, password, name);
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
    console.error('Register error:', err);
    return NextResponse.json(
      { error: 'アカウント登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}
