import { GoogleGenerativeAI } from '@google/generative-ai';
import { z } from 'zod';
import { Subject } from '@/types';

/**
 * Zod schema for single question extracted from test print image
 */
export const ExtractedQuestionSchema = z.object({
  number: z.number().int().positive(),
  prompt: z.string().min(1, '問題文が空です'),
  subPrompt: z.string().optional(),
  answer: z.string().min(1, '模範解答が空です'),
  explanation: z.string().optional(),
});

export type ExtractedQuestion = z.infer<typeof ExtractedQuestionSchema>;

/**
 * Zod schema for full test extraction response
 */
export const ExtractedExtractionSchema = z.object({
  title: z.string().min(1, 'タイトルが空です'),
  subject: z.enum(['japanese', 'math', 'science', 'social', 'english'] as const),
  questions: z.array(ExtractedQuestionSchema).min(1, '問題が1件も抽出できませんでした'),
});

export type ExtractedExtraction = z.infer<typeof ExtractedExtractionSchema>;

const SYSTEM_PROMPT = `
あなたは小学生向けプリントの採点・復習支援AIです。
アップロードされたテスト・プリントの写真から、問題と模範解答を抽出してデジタルテストを作成します。

【重要指示】
1. 赤ペンでの丸付け（◯、×、✓、点数）や子供の手書き文字（鉛筆の書き込みや間違えた答え）は【完全に無視】してください。
2. もともとプリントに印刷されている「問題文」と「本来の正しい正解（模範解答）」を特定・抽出してください。
3. 【超重要: 答えのネタバレ厳禁（問題文の中に正解の漢字や文字を絶対にそのまま書かないこと）】
   - 漢字の書き取り問題の場合: 問題文（prompt）の対象文字は必ず【カタカナ】（例: 【ヒロ】い公園、手紙を【オク】る）または【＿＿】（空欄）に変換してください。絶対に「【広】い公園」のように正解の漢字そのものを問題文に露出させてはいけません！
   - 穴埋め問題・計算問題の場合: 解答となる対象部分は「（　　）」や「【 ？ 】」にして空欄にしてください。
4. もしプリントに模範解答が印刷されていない場合（生徒の書き込みしかない場合）は、問題文の内容から客観的に正しい解答をあなたが推論・補完してください。
5. 対象教科は以下の5つの英語小文字コードのいずれか1つに分類してください:
   - japanese (国語・漢字・言葉)
   - math (算数・計算・図形)
   - science (理科・自然・実験)
   - social (社会・地理・歴史・くらし)
   - english (英語・アルファベット・英単語)
6. 小学3年生が読みやすいように、小学生が理解しやすい優しい解説（explanation）を短く添えてください。
7. 出力は必ず以下の形式の有効なJSONのみを出力してください（Markdownのコードブロック \`\`\`json も可ですが、純粋なJSONとしてパース可能な形式にしてください）。

【出力JSON構造】
{
  "title": "プリントのタイトル（例: 小3 漢字のたしかめプリント 第4回）",
  "subject": "japanese",
  "questions": [
    {
      "number": 1,
      "prompt": "【ヒロ】い公園で遊ぶ。",
      "subPrompt": "カタカナを漢字になおそう",
      "answer": "広",
      "explanation": "まだれ（广）の中に「ム」を書くよ"
    }
  ]
}
`;

/**
 * Extracts questions from an image buffer using Google Gemini Vision
 */
export async function extractTestFromImage(
  imageBuffer: Buffer,
  mimeType: string,
  apiKey?: string
): Promise<ExtractedExtraction> {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('GEMINI_API_KEY が設定されていません。環境変数をご確認ください。');
  }

  const genAI = new GoogleGenerativeAI(key);

  // Model: specified by user or environment variable (Default: gemini-3.8-flash)
  const modelName = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      temperature: 0.2,
      responseMimeType: 'application/json',
    },
  });

  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType,
    },
  };

  const prompt = 'この採点済みプリントから、赤ペン採点や手書き文字を無視し、印刷された問題文と正しい模範解答を抽出して指定のJSON形式で返してください。';

  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();

  if (!responseText) {
    throw new Error('Gemini APIから応答が得られませんでした。');
  }

  // Parse JSON with fallback extraction
  let parsedRaw: unknown;
  try {
    parsedRaw = JSON.parse(responseText);
  } catch {
    // If encapsulated in markdown code fence
    const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      parsedRaw = JSON.parse(jsonMatch[1]);
    } else {
      throw new Error('Gemini APIの応答をJSONとして解析できませんでした。');
    }
  }

  // Strict validation via Zod
  const validated = ExtractedExtractionSchema.safeParse(parsedRaw);
  if (!validated.success) {
    const errorDetails = validated.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(`抽出データの形式が仕様と異なります: ${errorDetails}`);
  }

  return validated.data;
}

