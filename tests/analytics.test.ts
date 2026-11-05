import { describe, it, expect } from 'vitest';
import { calculateAnalytics, calculateUserRank } from '@/lib/analytics';
import { TestSet } from '@/types';

describe('Analytics & User Rank Calculation', () => {
  it('should calculate initial rank correctly', () => {
    const rank = calculateUserRank(0, 0);
    expect(rank.level).toBe(1);
    expect(rank.title).toBe('かけだしドリル隊員');
    expect(rank.badge).toBe('🌱');
  });

  it('should level up when total correct and perfect tests increase', () => {
    const rank1 = calculateUserRank(6, 0); // 60 exp -> level 2
    expect(rank1.level).toBe(2);

    const rankTop = calculateUserRank(35, 4); // 350 + 200 = 550 exp -> level 5
    expect(rankTop.level).toBe(5);
    expect(rankTop.badge).toBe('👑');
  });

  it('should calculate overall analytics across multiple subjects', () => {
    const mockTests: TestSet[] = [
      {
        id: 't1',
        title: '国語テスト',
        subject: 'japanese',
        createdAt: '2026-11-05T00:00:00Z',
        questions: [
          { id: 'q1', number: 1, prompt: 'Q1', answer: 'A1', status: 'correct' },
          { id: 'q2', number: 2, prompt: 'Q2', answer: 'A2', status: 'correct' },
        ],
      },
      {
        id: 't2',
        title: '算数テスト',
        subject: 'math',
        createdAt: '2026-11-05T00:00:00Z',
        questions: [
          { id: 'q3', number: 1, prompt: 'Q3', answer: 'A3', status: 'correct' },
          { id: 'q4', number: 2, prompt: 'Q4', answer: 'A4', status: 'incorrect' },
        ],
      },
    ];

    const analytics = calculateAnalytics(mockTests);
    expect(analytics.totalTests).toBe(2);
    expect(analytics.totalQuestions).toBe(4);
    expect(analytics.totalCorrect).toBe(3);
    expect(analytics.totalIncorrect).toBe(1);
    expect(analytics.overallAccuracy).toBe(75);
    expect(analytics.perfectTestsCount).toBe(1); // Japanese test is 100%

    expect(analytics.subjectStats.japanese.correctQuestions).toBe(2);
    expect(analytics.subjectStats.japanese.accuracy).toBe(100);
    expect(analytics.subjectStats.math.accuracy).toBe(50);
    expect(analytics.strongestSubject).toBe('japanese');
    expect(analytics.weakestSubject).toBe('math');
  });
});
