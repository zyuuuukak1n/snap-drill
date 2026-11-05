import { NextRequest, NextResponse } from 'next/server';
import { extractTestFromImage } from '@/lib/gemini';
import { Subject } from '@/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    let buffer: Buffer;
    let mimeType: string;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          { error: '画像ファイルが見つかりません。「file」フィールドに画像を添付してください。' },
          { status: 400 }
        );
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'ファイルサイズが大きすぎます。10MB以下の画像を選択してください。' },
          { status: 413 }
        );
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: '非対応のファイル形式です。JPEG、PNG、WebP画像を選択してください。' },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      mimeType = file.type;
    } else if (contentType.includes('application/json')) {
      const body = await req.json();
      const { imageBase64, mime } = body;

      if (!imageBase64 || typeof imageBase64 !== 'string') {
        return NextResponse.json(
          { error: '画像データ（imageBase64）が送信されていません。' },
          { status: 400 }
        );
      }

      mimeType = mime || 'image/jpeg';
      if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
        return NextResponse.json(
          { error: '非対応のMIMEタイプです。image/jpeg, image/png, image/webp のいずれかを指定してください。' },
          { status: 400 }
        );
      }

      // Strip data:image/...;base64, prefix if present
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      buffer = Buffer.from(cleanBase64, 'base64');

      if (buffer.length > MAX_FILE_SIZE_BYTES) {
        return NextResponse.json(
          { error: 'ファイルサイズが大きすぎます。10MB以下の画像を選択してください。' },
          { status: 413 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Content-Typeは multipart/form-data または application/json である必要があります。' },
        { status: 400 }
      );
    }

    // Call Gemini API
    const extracted = await extractTestFromImage(buffer, mimeType);

    // Convert into our App Data Structure
    const testSetId = `test-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const questions = extracted.questions.map((q, idx) => ({
      id: `q-${testSetId}-${idx + 1}`,
      number: q.number || idx + 1,
      prompt: q.prompt,
      subPrompt: q.subPrompt,
      answer: q.answer,
      explanation: q.explanation,
      status: 'unanswered' as const,
    }));

    return NextResponse.json({
      success: true,
      data: {
        id: testSetId,
        title: extracted.title,
        subject: extracted.subject as Subject,
        createdAt: new Date().toISOString(),
        questions,
      },
    });
  } catch (error: unknown) {
    console.error('API Error in /api/extract-test:', error);
    const message = error instanceof Error ? error.message : 'プリントの解析中に予期せぬエラーが発生しました。';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

