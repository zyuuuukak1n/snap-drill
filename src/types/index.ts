export type Subject = 'japanese' | 'math' | 'science' | 'social' | 'english';

export type QuestionStatus = 'unanswered' | 'correct' | 'incorrect';

export interface Question {
  id: string;
  number: number;
  prompt: string;         // 問題文
  subPrompt?: string;     // 補足（例：「（長くなる／短くなる）からえらびましょう」）
  answer: string;        // 模範解答
  explanation?: string;   // かんたんな解説やヒント
  userDrawing?: string;  // Canvasから書き出したBase64画像（手書き履歴）
  status: QuestionStatus;
}

export interface TestSet {
  id: string;
  title: string;
  subject: Subject;
  createdAt: string;
  sourceImageUrl?: string;
  questions: Question[];
}

export interface SubjectMeta {
  key: Subject;
  label: string;
  hiragana: string;
  color: string;
  bgColor: string;
  borderColor: string;
  iconName: string;
}

export const SUBJECT_METAS: Record<Subject, SubjectMeta> = {
  japanese: {
    key: 'japanese',
    label: '国語',
    hiragana: 'こくご',
    color: '#E53935',
    bgColor: '#FFEBEE',
    borderColor: '#FFCDD2',
    iconName: 'BookOpen',
  },
  math: {
    key: 'math',
    label: '算数',
    hiragana: 'さんすう',
    color: '#1E88E5',
    bgColor: '#E3F2FD',
    borderColor: '#BBDEFB',
    iconName: 'Calculator',
  },
  science: {
    key: 'science',
    label: '理科',
    hiragana: 'りか',
    color: '#43A047',
    bgColor: '#E8F5E9',
    borderColor: '#C8E6C9',
    iconName: 'FlaskConical',
  },
  social: {
    key: 'social',
    label: '社会',
    hiragana: 'しゃかい',
    color: '#FB8C00',
    bgColor: '#FFF3E0',
    borderColor: '#FFE0B2',
    iconName: 'Compass',
  },
  english: {
    key: 'english',
    label: '英語',
    hiragana: 'えいご',
    color: '#8E24AA',
    bgColor: '#F3E5F5',
    borderColor: '#E1BEE7',
    iconName: 'Languages',
  },
};

