import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { getUserTestSetById, saveUserTestSet, deleteUserTestSet } from '@/lib/db';
import { TestSet } from '@/types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { id } = await params;
  const test = getUserTestSetById(user.id, id);
  if (!test) {
    return NextResponse.json({ error: 'テストが見つかりません' }, { status: 404 });
  }

  return NextResponse.json({ success: true, test });
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const updatedTest: TestSet = await req.json();
    updatedTest.id = id;
    saveUserTestSet(user.id, updatedTest);
    return NextResponse.json({ success: true, test: updatedTest });
  } catch (err: any) {
    console.error('Update test error:', err);
    return NextResponse.json({ error: 'テストの更新に失敗しました' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = getSessionUser(req);
  if (!user) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { id } = await params;
  const deleted = deleteUserTestSet(user.id, id);
  if (!deleted) {
    return NextResponse.json({ error: '対象のテストが見つかりませんでした' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
