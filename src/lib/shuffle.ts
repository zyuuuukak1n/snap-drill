import { Question, TestSet } from '@/types';

/**
 * Fisher-Yates array shuffle algorithm (pure function, returns new array)
 */
export function shuffleArray<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Filters incorrect or unanswered questions for intensive practice (特訓モード)
 */
export function extractReviewQuestions(questions: readonly Question[]): Question[] {
  return questions.filter((q) => q.status === 'incorrect' || q.status === 'unanswered');
}

/**
 * Calculates test statistics
 */
export interface TestProgress {
  total: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  percentage: number;
  isAllCorrect: boolean;
  isCompleted: boolean;
}

export function calculateProgress(questions: readonly Question[]): TestProgress {
  const total = questions.length;
  if (total === 0) {
    return {
      total: 0,
      correct: 0,
      incorrect: 0,
      unanswered: 0,
      percentage: 0,
      isAllCorrect: false,
      isCompleted: false,
    };
  }

  const correct = questions.filter((q) => q.status === 'correct').length;
  const incorrect = questions.filter((q) => q.status === 'incorrect').length;
  const unanswered = questions.filter((q) => q.status === 'unanswered').length;
  const percentage = Math.round((correct / total) * 100);

  return {
    total,
    correct,
    incorrect,
    unanswered,
    percentage,
    isAllCorrect: correct === total,
    isCompleted: unanswered === 0,
  };
}

/**
 * Determines whether a test set needs review
 */
export function needsReview(testSet: TestSet): boolean {
  const progress = calculateProgress(testSet.questions);
  return progress.incorrect > 0 || (!progress.isAllCorrect && progress.isCompleted);
}

