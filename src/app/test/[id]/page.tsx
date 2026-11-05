'use client';

import React, { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { SubjectBadge } from '@/components/SubjectBadge';
import { DrawingCanvas, DrawingCanvasHandle } from '@/components/DrawingCanvas';
import { HanamaruStamp } from '@/components/HanamaruStamp';
import { getTestSetById, updateQuestionResult } from '@/lib/storage';
import { shuffleArray, extractReviewQuestions } from '@/lib/shuffle';
import { playPopSound, playCorrectSound, playRetrySound } from '@/lib/audio';
import { TestSet, Question } from '@/types';
import {
  ArrowLeft,
  Eye,
  CheckCircle,
  RotateCcw,
  Shuffle,
  Filter,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

interface TestPageProps {
  params: Promise<{ id: string }>;
}

export default function TestPracticePage({ params }: TestPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const testId = resolvedParams.id;

  const [testSet, setTestSet] = useState<TestSet | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);
  const [showHanamaru, setShowHanamaru] = useState<boolean>(false);

  // Toggles
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isReviewOnly, setIsReviewOnly] = useState<boolean>(false);

  const canvasRef = useRef<DrawingCanvasHandle | null>(null);

  // Load test data
  useEffect(() => {
    const data = getTestSetById(testId);
    if (!data) return;

    setTestSet(data);
    setActiveQuestions(data.questions);
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [testId]);

  // Handle toggles change (shuffle / review only)
  const applyFilters = (shuffle: boolean, reviewOnly: boolean) => {
    if (!testSet) return;
    playPopSound();

    let list = [...testSet.questions];
    if (reviewOnly) {
      list = extractReviewQuestions(list);
      // If all questions were already correct, fallback to all
      if (list.length === 0) {
        alert('間違えた問題はありません！ぜんぶの問題を練習します。');
        list = [...testSet.questions];
        setIsReviewOnly(false);
        reviewOnly = false;
      }
    }

    if (shuffle) {
      list = shuffleArray(list);
    }

    setActiveQuestions(list);
    setCurrentIndex(0);
    setShowAnswer(false);
    canvasRef.current?.clear();
  };

  const handleToggleShuffle = () => {
    const next = !isShuffle;
    setIsShuffle(next);
    applyFilters(next, isReviewOnly);
  };

  const handleToggleReviewOnly = () => {
    const next = !isReviewOnly;
    setIsReviewOnly(next);
    applyFilters(isShuffle, next);
  };

  // Current active question
  const currentQ: Question | undefined = activeQuestions[currentIndex];

  // Fire confetti
  const fireConfetti = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#FF5252', '#FFB020', '#4CAF50', '#2196F3', '#FF4081'],
      });
    } catch {
      // Fallback if canvas-confetti fails
    }
  };

  // Handle user self-grading: Correct ("できた！")
  const handleMarkCorrect = () => {
    if (!currentQ || !testSet) return;

    playCorrectSound();
    fireConfetti();
    setShowHanamaru(true);

    const drawingData = canvasRef.current?.getImageDataUrl() || undefined;
    updateQuestionResult(testSet.id, currentQ.id, 'correct', drawingData);

    // Short pause to show hanamaru animation before advancing
    setTimeout(() => {
      setShowHanamaru(false);
      advanceNextQuestion();
    }, 1100);
  };

  // Handle user self-grading: Incorrect ("もう１かい")
  const handleMarkIncorrect = () => {
    if (!currentQ || !testSet) return;

    playRetrySound();
    const drawingData = canvasRef.current?.getImageDataUrl() || undefined;
    updateQuestionResult(testSet.id, currentQ.id, 'incorrect', drawingData);

    advanceNextQuestion();
  };

  const advanceNextQuestion = () => {
    setShowAnswer(false);
    canvasRef.current?.clear();

    if (currentIndex + 1 < activeQuestions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Completed all questions in session -> navigate to results
      router.push(`/result/${testId}`);
    }
  };

  if (!testSet) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center font-rounded p-4">
        <h2 className="text-xl font-bold text-stone-700 mb-2">テストが見つかりませんでした</h2>
        <Link
          href="/"
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-2xl border-2 border-primary-dark shadow-toy-sm"
        >
          ホームにもどる
        </Link>
      </div>
    );
  }

  if (activeQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col items-center justify-center font-rounded p-4">
        <h2 className="text-xl font-bold text-stone-700 mb-2">練習できる問題がありません</h2>
        <button
          onClick={() => applyFilters(false, false)}
          className="px-6 py-2.5 bg-primary text-white font-bold rounded-2xl border-2 border-primary-dark shadow-toy-sm"
        >
          すべての問題をリセットして解く
        </button>
      </div>
    );
  }

  // Cross guide enabled for Japanese / Kanji
  const isJapanese = testSet.subject === 'japanese';

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded select-none">
      {/* Practice Header */}
      <header className="sticky top-0 z-30 bg-amber-100/95 backdrop-blur-md border-b-2 border-amber-300 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              onClick={() => playPopSound()}
              className="p-2 rounded-2xl bg-white border-2 border-b-4 border-amber-400 hover:bg-amber-50 active:translate-y-0.5 active:border-b-2 transition-all flex items-center text-amber-900"
              title="一覧にもどる"
            >
              <ArrowLeft className="w-5 h-5 text-amber-800" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <SubjectBadge subject={testSet.subject} size="sm" />
                <h1 className="text-sm sm:text-base font-black text-amber-950 truncate max-w-[200px] sm:max-w-md">
                  {testSet.title}
                </h1>
              </div>
            </div>
          </div>

          {/* Question Counter Pill */}
          <div className="flex items-center gap-2">
            <div className="px-4 py-1.5 rounded-full bg-white border-2 border-amber-400 shadow-toy-sm text-sm sm:text-base font-black text-amber-950">
              第 <span className="text-primary-dark">{currentIndex + 1}</span> / {activeQuestions.length} 問
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace (Split Grid: Left Problem / Right Canvas on Chromebook) */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Toggles Bar: Shuffle & Review-only */}
        <div className="flex items-center justify-between gap-2 mb-4 bg-white/80 p-2.5 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2">
            {/* Review Only Toggle */}
            <button
              type="button"
              onClick={handleToggleReviewOnly}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 border-2 transition-all ${
                isReviewOnly
                  ? 'bg-orange-500 text-white border-orange-700 shadow-toy-sm translate-y-0.5'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>まちがえた問題だけ特訓</span>
            </button>

            {/* Shuffle Toggle */}
            <button
              type="button"
              onClick={handleToggleShuffle}
              className={`px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm flex items-center gap-1.5 border-2 transition-all ${
                isShuffle
                  ? 'bg-amber-500 text-white border-amber-700 shadow-toy-sm translate-y-0.5'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>シャッフル</span>
            </button>
          </div>

          <div className="text-xs font-bold text-stone-500 hidden sm:block">
            スタイラスペン・タッチ対応 ✏️
          </div>
        </div>

        {/* Core Layout: 2 Columns on desktop/Chromebook */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
          {/* Left Column (5 cols): Question Prompt Card & Answer Flip */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white rounded-3xl border-3 border-amber-300 p-5 sm:p-6 shadow-toy flex-1 flex flex-col justify-between relative overflow-hidden">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    もんだい {currentQ.number || currentIndex + 1}
                  </span>
                  {currentQ.status === 'correct' && (
                    <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> できた！
                    </span>
                  )}
                  {currentQ.status === 'incorrect' && (
                    <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                      <RotateCcw className="w-4 h-4" /> もう１回
                    </span>
                  )}
                </div>

                {/* Prompt Text */}
                <div className="my-4">
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 leading-relaxed">
                    {currentQ.prompt}
                  </h2>
                  {currentQ.subPrompt && (
                    <p className="mt-2 text-sm sm:text-base font-bold text-amber-800 bg-amber-50/80 p-3 rounded-2xl border border-amber-200">
                      💡 {currentQ.subPrompt}
                    </p>
                  )}
                </div>
              </div>

              {/* Model Answer Card (Flipped / Revealed) */}
              {showAnswer ? (
                <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 border-2 border-green-300 shadow-inner animate-pop-in">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-green-800 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-4 h-4 text-green-600" />
                      せいかい（模範解答）
                    </span>
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-green-700 tracking-wider mb-2 font-rounded">
                    {currentQ.answer}
                  </div>
                  {currentQ.explanation && (
                    <p className="text-xs sm:text-sm font-bold text-stone-600 bg-white/70 p-2.5 rounded-xl border border-green-200 leading-relaxed">
                      {currentQ.explanation}
                    </p>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setShowAnswer(true);
                    }}
                    className="w-full py-4 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-2xl border-2 border-b-6 border-amber-600 shadow-toy active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
                  >
                    <Eye className="w-5 h-5" />
                    <span>こたえをみる！👀</span>
                  </button>
                </div>
              )}
            </div>

            {/* Self-Grading Action Buttons (Visible after answer is revealed) */}
            {showAnswer && (
              <div className="bg-white rounded-3xl border-3 border-amber-300 p-4 shadow-toy animate-pop-in flex flex-col gap-2">
                <span className="text-xs font-black text-stone-500 text-center">
                  自分の書いた文字と比べてみよう！
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Incorrect Button */}
                  <button
                    type="button"
                    onClick={handleMarkIncorrect}
                    className="py-3.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-2xl border-2 border-b-4 border-stone-400 shadow-toy-sm active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <RotateCcw className="w-5 h-5 text-stone-600" />
                    <span>もう１かい🔄</span>
                  </button>

                  {/* Correct Button */}
                  <button
                    type="button"
                    onClick={handleMarkCorrect}
                    className="py-3.5 px-4 bg-hanamaru hover:bg-red-600 text-white font-black rounded-2xl border-2 border-b-4 border-red-800 shadow-toy-sm active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <span>できた！💮</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column (7 cols): Chromebook Handwriting Canvas */}
          <div className="lg:col-span-7 flex flex-col relative min-h-[380px] sm:min-h-[460px]">
            <DrawingCanvas
              ref={canvasRef}
              showCrossGuide={isJapanese}
              initialImage={currentQ.userDrawing}
            />

            {/* Pop-up Hanamaru Stamp Animation on Correct */}
            {showHanamaru && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-20 pointer-events-none">
                <HanamaruStamp size={200} showText />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
