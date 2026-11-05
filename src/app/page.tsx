'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { SubjectBadge } from '@/components/SubjectBadge';
import { HanamaruStamp } from '@/components/HanamaruStamp';
import { fetchCurrentUser, fetchUserTestSets, deleteTestSetUnified, AuthUser } from '@/lib/api-client';
import { calculateProgress, needsReview } from '@/lib/shuffle';
import { Subject, SUBJECT_METAS, TestSet } from '@/types';
import {
  Plus,
  Play,
  RotateCcw,
  Trash2,
  AlertCircle,
  Sparkles,
  BookOpen,
  Award,
  LogIn,
} from 'lucide-react';
import { playPopSound } from '@/lib/audio';

type SubjectFilter = 'all' | Subject;

export default function HomePage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<SubjectFilter>('all');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(async (user) => {
      setCurrentUser(user);
      const list = await fetchUserTestSets(!!user);
      setTestSets(list);
      setIsLoaded(true);
    });
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm(`「${title}」を削除してもよろしいですか？`)) {
      playPopSound();
      await deleteTestSetUnified(id, !!currentUser);
      setTestSets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const filteredTests = testSets.filter((t) => {
    if (selectedSubject === 'all') return true;
    return t.subject === selectedSubject;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8">
        {/* Banner for login encouragement if not logged in */}
        {!currentUser && isLoaded && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-100/90 border-2 border-amber-300 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-700 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-amber-950">
                アカウントを作ってログインすると、テスト結果や手書き履歴がサーバーにずっと保存されます！
              </span>
            </div>
            <Link
              href="/login"
              onClick={() => playPopSound()}
              className="px-4 py-1.5 rounded-xl bg-primary-yellow hover:bg-amber-400 text-amber-950 text-xs font-black border-2 border-amber-600 shadow-toy-sm"
            >
              ログイン / 登録
            </Link>
          </div>
        )}

        {/* Hero Banner for Chromebook Touch & Kids */}
        <div className="mb-8 p-5 sm:p-6 bg-gradient-to-r from-amber-100 via-orange-50 to-amber-200 rounded-3xl border-3 border-amber-300 shadow-toy relative overflow-hidden">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-amber-300 text-amber-900 text-xs sm:text-sm font-black mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              プリントを写真でパシャッと撮るだけ！
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-950 mb-2 leading-tight">
              間違えたところを、
              <br />
              手書きで楽しくマスターしよう！✏️
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              学校のプリントやテストの写真をアップロードすると、AIが自動で問題を作ってくれます。
              スタイラスペンで画面に直接書いて反復練習しよう！
            </p>
          </div>
          <div className="absolute right-3 -bottom-4 opacity-20 sm:opacity-40 pointer-events-none">
            <Award className="w-44 h-44 text-amber-500" />
          </div>
        </div>

        {/* Subject Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              setSelectedSubject('all');
            }}
            className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2 border-b-4 ${
              selectedSubject === 'all'
                ? 'bg-amber-500 text-white border-amber-700 shadow-toy-sm translate-y-0.5'
                : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-50'
            }`}
          >
            🌟 すべて ({testSets.length})
          </button>
          {(Object.keys(SUBJECT_METAS) as Subject[]).map((subj) => {
            const meta = SUBJECT_METAS[subj];
            const count = testSets.filter((t) => t.subject === subj).length;
            const isSelected = selectedSubject === subj;

            return (
              <button
                key={subj}
                type="button"
                onClick={() => {
                  playPopSound();
                  setSelectedSubject(subj);
                }}
                className={`px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all border-2 border-b-4 ${
                  isSelected
                    ? 'border-b-2 translate-y-0.5 shadow-sm'
                    : 'bg-white hover:bg-stone-50'
                }`}
                style={{
                  backgroundColor: isSelected ? meta.bgColor : '#FFFFFF',
                  color: meta.color,
                  borderColor: meta.borderColor,
                }}
              >
                {meta.label}（{meta.hiragana}） ({count})
              </button>
            );
          })}
        </div>

        {/* Test Cards Grid */}
        {isLoaded && filteredTests.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-3xl border-2 border-dashed border-stone-300">
            <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-stone-700 mb-1">
              テストがまだ登録されていません
            </h3>
            <p className="text-xs text-stone-500 mb-6">
              右下のボタンからプリントの写真を撮って、問題を追加してみよう！
            </p>
            <Link
              href="/create"
              onClick={() => playPopSound()}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-yellow hover:bg-amber-400 text-amber-950 font-black rounded-2xl border-2 border-b-4 border-amber-600 shadow-toy active:translate-y-1 active:border-b-0 transition-all text-sm"
            >
              <Plus className="w-5 h-5" />
              あたらしいプリントをよみこむ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredTests.map((test) => {
              const progress = calculateProgress(test.questions);
              const hasMistakes = needsReview(test);

              return (
                <div
                  key={test.id}
                  className="bg-white rounded-3xl border-2 border-b-4 border-amber-200 p-5 shadow-toy hover:border-amber-400 transition-all flex flex-col justify-between relative group"
                >
                  {/* Top Bar: Subject Badge & Badges */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <SubjectBadge subject={test.subject} showHiragana />

                      <div className="flex items-center gap-1.5">
                        {progress.isAllCorrect && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 text-xs font-black">
                            💮 かんぺき！
                          </span>
                        )}
                        {hasMistakes && (
                          <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-black animate-pulse">
                            <AlertCircle className="w-3.5 h-3.5" />
                            復習しよう
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Test Title */}
                    <h2 className="text-lg sm:text-xl font-black text-stone-800 mb-2 line-clamp-2">
                      {test.title}
                    </h2>

                    {/* Stats & Progress Bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs font-bold text-stone-500 mb-1">
                        <span>
                          全 {progress.total} 問 （正解 {progress.correct} / 誤答 {progress.incorrect}）
                        </span>
                        <span>{progress.percentage}% 完了</span>
                      </div>
                      <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            progress.isAllCorrect
                              ? 'bg-red-500'
                              : progress.percentage > 50
                              ? 'bg-green-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Stamp Decorator if 100% */}
                  {progress.isAllCorrect && (
                    <div className="absolute right-4 top-14 pointer-events-none opacity-80 rotate-12 scale-90">
                      <HanamaruStamp size={70} showText={false} />
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, test.id, test.title)}
                      className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="このテストを削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/test/${test.id}`}
                        onClick={() => playPopSound()}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary-yellow hover:bg-amber-400 text-amber-950 font-black rounded-2xl border-2 border-b-4 border-amber-600 shadow-toy-sm active:translate-y-0.5 active:border-b-2 transition-all text-sm"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>練習する</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Action Button (FAB) for Chromebook touch & easy creation */}
      <Link
        href="/create"
        onClick={() => playPopSound()}
        className="fixed right-6 bottom-6 z-40 flex items-center gap-2.5 px-6 py-4 bg-primary text-white font-black rounded-3xl border-3 border-b-6 border-primary-dark shadow-toy-lg hover:bg-primary-hover active:translate-y-1 active:border-b-3 transition-all"
        title="あたらしいプリントをよみこむ"
      >
        <span className="p-1 rounded-full bg-white/20">
          <Plus className="w-6 h-6 stroke-[3]" />
        </span>
        <span className="text-base sm:text-lg">あたらしいプリントをよみこむ</span>
      </Link>
    </div>
  );
}
