import { TestSet, Question, Subject, SUBJECT_METAS } from '@/types';
import { calculateProgress } from './shuffle';

export interface SubjectStat {
  subject: Subject;
  label: string;
  hiragana: string;
  color: string;
  bgColor: string;
  totalQuestions: number;
  correctQuestions: number;
  accuracy: number;
  completedTests: number;
  perfectTests: number;
}

export interface UserRank {
  level: number;
  title: string;
  badge: string;
  description: string;
  nextLevelThreshold: number;
  progressPercent: number;
}

export interface OverallAnalytics {
  totalTests: number;
  totalQuestions: number;
  totalAnswered: number;
  totalCorrect: number;
  totalIncorrect: number;
  overallAccuracy: number;
  perfectTestsCount: number;
  userRank: UserRank;
  subjectStats: Record<Subject, SubjectStat>;
  strongestSubject: Subject | null;
  weakestSubject: Subject | null;
}

/**
 * Calculates user rank & level based on total correct answers and perfect test sets
 */
export function calculateUserRank(totalCorrect: number, perfectTestsCount: number): UserRank {
  // Score calculated as: correct answers * 10 + perfect test * 50
  const totalExp = totalCorrect * 10 + perfectTestsCount * 50;

  const ranks = [
    { level: 1, title: 'かけだしドリル隊員', badge: '🌱', threshold: 0, description: 'まずはプリントを解いてみよう！' },
    { level: 2, title: 'がんばり学習マスター', badge: '⭐', threshold: 50, description: '毎日コツコツ練習が進んでいるね！' },
    { level: 3, title: 'ひらめき博士', badge: '💡', threshold: 120, description: '問題がスラスラ解けるようになってきた！' },
    { level: 4, title: 'スナップドリル大達人', badge: '🔥', threshold: 250, description: 'たくさんのプリントをクリアした証！' },
    { level: 5, title: 'パーフェクト花丸王者💮', badge: '👑', threshold: 500, description: '全教科マスター！向かうところ敵なし！' },
  ];

  let currentRank = ranks[0];
  let nextRank = ranks[1];

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (totalExp >= ranks[i].threshold) {
      currentRank = ranks[i];
      nextRank = ranks[i + 1] || ranks[i];
      break;
    }
  }

  const isMaxLevel = currentRank.level === nextRank.level;
  const range = nextRank.threshold - currentRank.threshold;
  const currentProgress = totalExp - currentRank.threshold;
  const progressPercent = isMaxLevel ? 100 : Math.min(100, Math.round((currentProgress / (range || 1)) * 100));

  return {
    level: currentRank.level,
    title: currentRank.title,
    badge: currentRank.badge,
    description: currentRank.description,
    nextLevelThreshold: nextRank.threshold,
    progressPercent,
  };
}

/**
 * Calculates complete analytics summary for all test sets
 */
export function calculateAnalytics(testSets: readonly TestSet[]): OverallAnalytics {
  let totalQuestions = 0;
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalAnswered = 0;
  let perfectTestsCount = 0;

  // Initialize subject stats
  const subjectStats: Record<Subject, SubjectStat> = {
    japanese: createEmptySubjectStat('japanese'),
    math: createEmptySubjectStat('math'),
    science: createEmptySubjectStat('science'),
    social: createEmptySubjectStat('social'),
    english: createEmptySubjectStat('english'),
  };

  testSets.forEach((test) => {
    const progress = calculateProgress(test.questions);
    totalQuestions += progress.total;
    totalCorrect += progress.correct;
    totalIncorrect += progress.incorrect;
    totalAnswered += (progress.correct + progress.incorrect);

    if (progress.isAllCorrect && progress.total > 0) {
      perfectTestsCount += 1;
    }

    // Accumulate subject
    const subj = test.subject;
    if (subjectStats[subj]) {
      subjectStats[subj].totalQuestions += progress.total;
      subjectStats[subj].correctQuestions += progress.correct;
      if (progress.isCompleted && progress.total > 0) {
        subjectStats[subj].completedTests += 1;
      }
      if (progress.isAllCorrect && progress.total > 0) {
        subjectStats[subj].perfectTests += 1;
      }
    }
  });

  // Calculate subject accuracies
  (Object.keys(subjectStats) as Subject[]).forEach((subj) => {
    const s = subjectStats[subj];
    s.accuracy = s.totalQuestions > 0 ? Math.round((s.correctQuestions / s.totalQuestions) * 100) : 0;
  });

  const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  const userRank = calculateUserRank(totalCorrect, perfectTestsCount);

  // Find strongest and weakest subjects (among those with at least 1 question)
  const activeSubjects = (Object.keys(subjectStats) as Subject[]).filter(
    (subj) => subjectStats[subj].totalQuestions > 0
  );

  let strongestSubject: Subject | null = null;
  let weakestSubject: Subject | null = null;

  if (activeSubjects.length > 0) {
    activeSubjects.sort((a, b) => subjectStats[b].accuracy - subjectStats[a].accuracy);
    strongestSubject = activeSubjects[0];
    weakestSubject = activeSubjects[activeSubjects.length - 1];
  }

  return {
    totalTests: testSets.length,
    totalQuestions,
    totalAnswered,
    totalCorrect,
    totalIncorrect,
    overallAccuracy,
    perfectTestsCount,
    userRank,
    subjectStats,
    strongestSubject,
    weakestSubject,
  };
}

function createEmptySubjectStat(subject: Subject): SubjectStat {
  const meta = SUBJECT_METAS[subject];
  return {
    subject,
    label: meta.label,
    hiragana: meta.hiragana,
    color: meta.color,
    bgColor: meta.bgColor,
    totalQuestions: 0,
    correctQuestions: 0,
    accuracy: 0,
    completedTests: 0,
    perfectTests: 0,
  };
}
