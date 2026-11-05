import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserTestSets, saveUserTestSet } from '@/lib/db';
import { TestSet } from '@/types';

export async function GET(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const testSets = getUserTestSets(user.id);
  return NextResponse.json({ success: true, testSets });
}

export async function POST(req: NextRequest) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  try {
    const test: TestSet = await req.json();
    saveUserTestSet(user.id, test);
    return NextResponse.json({ success: true, test });
  } catch (err: any) {
    console.error('Save test error:', err);
    return NextResponse.json({ error: 'テストの保存に失敗しました' }, { status: 500 });
  }
}
