import { describe, it, expect } from 'vitest';
import {
  shuffleArray,
  extractReviewQuestions,
  calculateProgress,
  needsReview,
} from '@/lib/shuffle';
import { Question, TestSet } from '@/types';

describe('shuffleArray', () => {
  it('should maintain array length and contain all original items', () => {
    const input = [1, 2, 3, 4, 5];
    const output = shuffleArray(input);

    expect(output).toHaveLength(input.length);
    expect(output.sort()).toEqual(input.sort());
  });

  it('should handle empty and single-element arrays', () => {
    expect(shuffleArray([])).toEqual([]);
    expect(shuffleArray([42])).toEqual([42]);
  });

  it('should not mutate original array', () => {
    const input = [1, 2, 3];
    const copy = [...input];
    shuffleArray(input);
    expect(input).toEqual(copy);
  });
});

describe('extractReviewQuestions', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      number: 1,
      prompt: 'Q1',
      answer: 'A1',
      status: 'correct',
    },
    {
      id: 'q2',
      number: 2,
      prompt: 'Q2',
      answer: 'A2',
      status: 'incorrect',
    },
    {
      id: 'q3',
      number: 3,
      prompt: 'Q3',
      answer: 'A3',
      status: 'unanswered',
    },
  ];

  it('should return only incorrect or unanswered questions', () => {
    const result = extractReviewQuestions(sampleQuestions);
    expect(result).toHaveLength(2);
    expect(result.map((q) => q.id)).toEqual(['q2', 'q3']);
  });
});

describe('calculateProgress', () => {
  it('should correctly calculate progress metrics', () => {
    const questions: Question[] = [
      { id: '1', number: 1, prompt: 'A', answer: 'A', status: 'correct' },
      { id: '2', number: 2, prompt: 'B', answer: 'B', status: 'correct' },
      { id: '3', number: 3, prompt: 'C', answer: 'C', status: 'incorrect' },
      { id: '4', number: 4, prompt: 'D', answer: 'D', status: 'unanswered' },
    ];

    const progress = calculateProgress(questions);
    expect(progress.total).toBe(4);
    expect(progress.correct).toBe(2);
    expect(progress.incorrect).toBe(1);
    expect(progress.unanswered).toBe(1);
    expect(progress.percentage).toBe(50);
    expect(progress.isAllCorrect).toBe(false);
    expect(progress.isCompleted).toBe(false);
  });

  it('should detect when all questions are correct', () => {
    const questions: Question[] = [
      { id: '1', number: 1, prompt: 'A', answer: 'A', status: 'correct' },
      { id: '2', number: 2, prompt: 'B', answer: 'B', status: 'correct' },
    ];

    const progress = calculateProgress(questions);
    expect(progress.percentage).toBe(100);
    expect(progress.isAllCorrect).toBe(true);
    expect(progress.isCompleted).toBe(true);
  });
});

describe('needsReview', () => {
  const baseTest: TestSet = {
    id: 't1',
    title: 'Test',
    subject: 'math',
    createdAt: new Date().toISOString(),
    questions: [],
  };

  it('should return true if there is an incorrect question', () => {
    const test: TestSet = {
      ...baseTest,
      questions: [
        { id: '1', number: 1, prompt: 'A', answer: 'A', status: 'incorrect' },
      ],
    };
    expect(needsReview(test)).toBe(true);
  });

  it('should return false if all questions are correct', () => {
    const test: TestSet = {
      ...baseTest,
      questions: [
        { id: '1', number: 1, prompt: 'A', answer: 'A', status: 'correct' },
      ],
    };
    expect(needsReview(test)).toBe(false);
  });
});

