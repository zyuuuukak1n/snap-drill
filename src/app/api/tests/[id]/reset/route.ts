import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserTestSetById, saveUserTestSet } from '@/lib/db';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { id } = await params;
  const test = getUserTestSetById(user.id, id);
  if (!test) {
    return NextResponse.json({ error: 'テストが見つかりません' }, { status: 404 });
  }

  test.questions = test.questions.map((q) => ({
    ...q,
    status: 'unanswered',
    userDrawing: undefined,
  }));

  saveUserTestSet(user.id, test);
  return NextResponse.json({ success: true, test });
}

