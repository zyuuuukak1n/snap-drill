'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { Header } from '@/components/Header';
import { SubjectBadge } from '@/components/SubjectBadge';
import { HanamaruStamp } from '@/components/HanamaruStamp';
import {
  fetchCurrentUser,
  fetchTestSetById,
  resetTestProgressUnified,
  AuthUser,
} from '@/lib/api-client';
import { calculateProgress } from '@/lib/shuffle';
import { playPopSound, playFanfareSound, playCorrectSound } from '@/lib/audio';
import { TestSet, Question } from '@/types';
import {
  RotateCcw,
  Home,
  Zap,
  CheckCircle,
  XCircle,
  Award,
  ArrowRight,
} from 'lucide-react';

interface ResultPageProps {
  params: Promise<{ id: string }>;
}

export default function ResultPage({ params }: ResultPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const testId = resolvedParams.id;

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [testSet, setTestSet] = useState<TestSet | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(async (user) => {
      setCurrentUser(user);
      const data = await fetchTestSetById(testId, !!user);
      if (!data) return;
      setTestSet(data);

      const progress = calculateProgress(data.questions);
      if (progress.isAllCorrect) {
        playFanfareSound();
        try {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#FF5252', '#FFB020', '#4CAF50', '#2196F3', '#FF4081'],
          });
        } catch {}
      } else {
        playCorrectSound();
      }
    });
  }, [testId]);

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

  const progress = calculateProgress(testSet.questions);
  const incorrectQuestions = testSet.questions.filter((q) => q.status === 'incorrect');

  const handleRestartAll = async () => {
    playPopSound();
    await resetTestProgressUnified(testId, !!currentUser);
    router.push(`/test/${testId}`);
  };

  const handlePracticeIncorrectOnly = () => {
    playPopSound();
    router.push(`/test/${testId}`);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded">
      <Header title="けっかはっぴょう" showBackHome />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border-3 border-amber-300 p-6 sm:p-8 shadow-toy text-center relative overflow-hidden">
          {/* Badge & Subject */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <SubjectBadge subject={testSet.subject} />
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-amber-950 mb-4">
            {testSet.title}
          </h1>

          {/* Stamp / Result Hero */}
          <div className="my-6">
            {progress.isAllCorrect ? (
              <div className="flex flex-col items-center justify-center animate-pop-in">
                <HanamaruStamp size={160} showText={false} />
                <h2 className="text-3xl sm:text-4xl font-black text-hanamaru mt-3 mb-1">
                  ぜんぶできたね！💮
                </h2>
                <p className="text-sm font-bold text-stone-600">
                  パーフェクト！たいへんよくがんばりました！
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center animate-pop-in">
                <div className="w-24 h-24 rounded-full bg-amber-100 border-3 border-amber-300 flex items-center justify-center text-amber-800 mb-3 shadow-inner">
                  <Award className="w-14 h-14" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-stone-800 mb-1">
                  おつかれさま！
                </h2>
                <p className="text-sm font-bold text-amber-800">
                  あと <span className="text-xl text-hanamaru font-black">{progress.incorrect}</span> 問でパーフェクト！
                </p>
              </div>
            )}
          </div>

          {/* Score Box */}
          <div className="max-w-md mx-auto my-6 p-4 rounded-2xl bg-amber-50 border-2 border-amber-200">
            <div className="flex items-center justify-around">
              <div>
                <span className="text-xs font-bold text-stone-500 block">正解</span>
                <span className="text-3xl font-black text-green-600">
                  {progress.correct}
                  <span className="text-xs text-stone-500 font-bold ml-1">/ {progress.total}問</span>
                </span>
              </div>
              <div className="h-10 w-px bg-amber-200" />
              <div>
                <span className="text-xs font-bold text-stone-500 block">正解率</span>
                <span className="text-3xl font-black text-amber-900">
                  {progress.percentage}
                  <span className="text-xs text-stone-500 font-bold ml-1">%</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="max-w-md mx-auto flex flex-col gap-3 my-6">
            {incorrectQuestions.length > 0 && (
              <button
                type="button"
                onClick={handlePracticeIncorrectOnly}
                className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl border-2 border-b-6 border-primary-dark shadow-toy active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-2 text-base sm:text-lg animate-bounce-short"
              >
                <Zap className="w-5 h-5 fill-current" />
                <span>まちがえたところだけ もう１回！（{incorrectQuestions.length}問）</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRestartAll}
              className="w-full py-3.5 px-6 bg-white hover:bg-amber-50 text-amber-950 font-black rounded-2xl border-2 border-b-4 border-amber-400 shadow-toy-sm active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <RotateCcw className="w-4 h-4" />
              <span>最初からやり直す</span>
            </button>

            <Link
              href="/"
              onClick={() => playPopSound()}
              className="w-full py-3.5 px-6 bg-stone-100 hover:bg-stone-200 text-stone-700 font-black rounded-2xl border-2 border-b-4 border-stone-300 shadow-toy-sm active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Home className="w-4 h-4" />
              <span>一覧にもどる</span>
            </Link>
          </div>

          {/* Review List for Questions */}
          <div className="mt-8 text-left border-t border-stone-200 pt-6">
            <h3 className="text-base font-black text-stone-800 mb-3 flex items-center gap-2">
              <span>問題のふりかえり</span>
            </h3>
            <div className="space-y-3">
              {testSet.questions.map((q, idx) => {
                const isCorrect = q.status === 'correct';
                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border-2 flex items-start gap-3 ${
                      isCorrect
                        ? 'bg-green-50/50 border-green-200'
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    <span className="shrink-0 mt-0.5">
                      {isCorrect ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </span>
                    <div className="flex-1 text-xs sm:text-sm">
                      <div className="font-bold text-stone-800 mb-1">
                        第{idx + 1}問: {q.prompt}
                      </div>
                      <div className="text-stone-600 flex flex-wrap gap-x-4">
                        <span>
                          模範解答: <strong className="text-stone-900">{q.answer}</strong>
                        </span>
                        {q.explanation && (
                          <span className="text-stone-500">（{q.explanation}）</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

