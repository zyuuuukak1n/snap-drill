import { describe, it, expect } from 'vitest';
import {
  ExtractedQuestionSchema,
  ExtractedExtractionSchema,
} from '@/lib/gemini';

describe('Gemini Extraction Zod Schemas', () => {
  describe('ExtractedQuestionSchema', () => {
    it('should validate valid question object', () => {
      const valid = {
        number: 1,
        prompt: '【広】い公園で遊ぶ。',
        subPrompt: 'カタカナを漢字になおそう',
        answer: '広',
        explanation: 'まだれ（广）の中に「ム」を書くよ',
      };

      const result = ExtractedQuestionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject missing prompt or answer', () => {
      const invalid = {
        number: 1,
        prompt: '',
        answer: '',
      };

      const result = ExtractedQuestionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('ExtractedExtractionSchema', () => {
    it('should validate complete test object with 5 subjects', () => {
      const valid = {
        title: '小3 算数 まとめテスト',
        subject: 'math',
        questions: [
          {
            number: 1,
            prompt: '24 × 3 = ?',
            answer: '72',
          },
        ],
      };

      const result = ExtractedExtractionSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('should reject unsupported subject code', () => {
      const invalid = {
        title: '音楽テスト',
        subject: 'music', // not in japanese, math, science, social, english
        questions: [
          {
            number: 1,
            prompt: 'Q',
            answer: 'A',
          },
        ],
      };

      const result = ExtractedExtractionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('should reject empty question list', () => {
      const invalid = {
        title: '小3 テスト',
        subject: 'japanese',
        questions: [],
      };

      const result = ExtractedExtractionSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});

