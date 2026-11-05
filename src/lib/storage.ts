import { TestSet, Question, Subject } from '@/types';

const STORAGE_KEY = 'snap_drill_test_sets_v1';

/**
 * Initial sample tests so kids/parents can play right away even without uploading!
 */
export const INITIAL_SAMPLE_TESTS: TestSet[] = [
  {
    id: 'sample-japanese-1',
    title: '小3 漢字のたしかめプリント 第4回',
    subject: 'japanese',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q1-1',
        number: 1,
        prompt: '【広】い公園で遊ぶ。',
        subPrompt: 'カタカナを漢字になおそう（ひろい）',
        answer: '広',
        explanation: 'まだれ（广）の中に「ム」を書くよ。マス目の中心を意識しよう！',
        status: 'unanswered',
      },
      {
        id: 'q1-2',
        number: 2,
        prompt: '手紙を【送】る。',
        subPrompt: 'カタカナを漢字になおそう（おくる）',
        answer: '送',
        explanation: 'しんにょうの点と払いをていねいに。',
        status: 'unanswered',
      },
      {
        id: 'q1-3',
        number: 3,
        prompt: '太陽の【光】があたる。',
        subPrompt: 'カタカナを漢字になおそう（ひかり）',
        answer: '光',
        explanation: '上の点３つのバランスと、下の曲がりハネがポイント！',
        status: 'unanswered',
      },
    ],
  },
  {
    id: 'sample-math-1',
    title: '小3 算数 かけ算の筆算まとめ',
    subject: 'math',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q2-1',
        number: 1,
        prompt: '２４ × ３ ＝ ？',
        subPrompt: 'ひっ算で計算してみよう',
        answer: '72',
        explanation: '一の位: 4×3=12（1くり上がり）、十の位: 2×3=6 + 1 = 7。答えは 72 だよ！',
        status: 'unanswered',
      },
      {
        id: 'q2-2',
        number: 2,
        prompt: '３５ × ４ ＝ ？',
        subPrompt: 'くり上がりに気をつけてね',
        answer: '140',
        explanation: '5×4=20（2くりあがり）、3×4=12+2=14。答えは 140！',
        status: 'unanswered',
      },
    ],
  },
  {
    id: 'sample-science-1',
    title: '小3 理科 太陽のうごきとかげ',
    subject: 'science',
    createdAt: new Date().toISOString(),
    questions: [
      {
        id: 'q3-1',
        number: 1,
        prompt: '太陽が南にあるとき、かげはどの方角にできるかな？',
        subPrompt: '（東・西・南・北）からえらんで書こう',
        answer: '北',
        explanation: 'かげは太陽の反対側にできるから、南の反対の「北」だよ！',
        status: 'unanswered',
      },
    ],
  },
];

/**
 * Loads all test sets from LocalStorage with fallback to initial sample data
 */
export function loadAllTestSets(): TestSet[] {
  if (typeof window === 'undefined') {
    return INITIAL_SAMPLE_TESTS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TESTS));
      return INITIAL_SAMPLE_TESTS;
    }
    const parsed = JSON.parse(raw) as TestSet[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_TESTS));
      return INITIAL_SAMPLE_TESTS;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to load test sets from LocalStorage:', err);
    return INITIAL_SAMPLE_TESTS;
  }
}

/**
 * Retrieves a single test set by ID
 */
export function getTestSetById(id: string): TestSet | null {
  const tests = loadAllTestSets();
  return tests.find((t) => t.id === id) || null;
}

/**
 * Saves or updates a test set
 */
export function saveTestSet(testSet: TestSet): void {
  if (typeof window === 'undefined') return;

  const current = loadAllTestSets();
  const index = current.findIndex((t) => t.id === testSet.id);

  let updated: TestSet[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = testSet;
  } else {
    updated = [testSet, ...current];
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save test set:', err);
  }
}

/**
 * Updates a question's status and drawing within a test set
 */
export function updateQuestionResult(
  testSetId: string,
  questionId: string,
  status: 'correct' | 'incorrect',
  drawingDataUrl?: string
): TestSet | null {
  const testSet = getTestSetById(testSetId);
  if (!testSet) return null;

  const questions = testSet.questions.map((q) => {
    if (q.id === questionId) {
      return {
        ...q,
        status,
        userDrawing: drawingDataUrl !== undefined ? drawingDataUrl : q.userDrawing,
      };
    }
    return q;
  });

  const updatedTestSet: TestSet = {
    ...testSet,
    questions,
  };

  saveTestSet(updatedTestSet);
  return updatedTestSet;
}

/**
 * Resets all question statuses in a test set
 */
export function resetTestProgress(testSetId: string): TestSet | null {
  const testSet = getTestSetById(testSetId);
  if (!testSet) return null;

  const questions = testSet.questions.map((q) => ({
    ...q,
    status: 'unanswered' as const,
    userDrawing: undefined,
  }));

  const updatedTestSet: TestSet = {
    ...testSet,
    questions,
  };

  saveTestSet(updatedTestSet);
  return updatedTestSet;
}

/**
 * Deletes a test set by ID
 */
export function deleteTestSet(id: string): void {
  if (typeof window === 'undefined') return;

  const current = loadAllTestSets();
  const updated = current.filter((t) => t.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete test set:', err);
  }
}
