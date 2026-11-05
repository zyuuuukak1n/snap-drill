'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { SubjectBadge } from '@/components/SubjectBadge';
import { HanamaruStamp } from '@/components/HanamaruStamp';
import { fetchCurrentUser, fetchUserTestSets, AuthUser } from '@/lib/api-client';
import { calculateAnalytics, OverallAnalytics } from '@/lib/analytics';
import { Subject, SUBJECT_METAS, TestSet } from '@/types';
import { playPopSound } from '@/lib/audio';
import {
  User,
  Award,
  Sparkles,
  CheckCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Flame,
  PlusCircle,
  LogOut,
  LogIn,
} from 'lucide-react';

export default function MyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [testSets, setTestSets] = useState<TestSet[]>([]);
  const [analytics, setAnalytics] = useState<OverallAnalytics | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    fetchCurrentUser().then(async (user) => {
      setCurrentUser(user);
      const list = await fetchUserTestSets(!!user);
      setTestSets(list);
      setAnalytics(calculateAnalytics(list));
      setIsLoaded(true);
    });
  }, []);

  const handleLogout = async () => {
    playPopSound();
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  if (!isLoaded || !analytics) {
    return (
      <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded">
        <Header title="マイページ" showBackHome />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-amber-800 font-bold text-sm animate-pulse">
            データを読み込み中…✏️
          </div>
        </div>
      </div>
    );
  }

  const { userRank, subjectStats, strongestSubject, weakestSubject } = analytics;

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded">
      <Header title="マイページ・学習分析" showBackHome />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
        {/* User Profile & Rank Hero Card */}
        <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-200 rounded-3xl border-3 border-amber-300 p-6 shadow-toy relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white border-3 border-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-inner shrink-0">
                {userRank.badge}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    Lv.{userRank.level}
                  </span>
                  <span className="text-sm sm:text-base font-black text-amber-900">
                    {userRank.title}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-amber-950">
                  {currentUser ? `${currentUser.name} さんのノート` : 'ゲスト さんのノート'}
                </h1>
                <p className="text-xs text-stone-600 mt-1">
                  {userRank.description}
                </p>
              </div>
            </div>

            {/* Rank Level Progress Bar */}
            <div className="w-full sm:w-64 bg-white/80 p-3.5 rounded-2xl border border-amber-300 shadow-sm shrink-0">
              <div className="flex items-center justify-between text-xs font-black text-stone-700 mb-1">
                <span>次のランクまで</span>
                <span>{userRank.progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${userRank.progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-stone-500 block text-right mt-1">
                正解と花丸💮をあつめてレベルアップ！
              </span>
            </div>
          </div>
        </div>

        {/* 4 Stats Highlights Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl border-2 border-b-4 border-amber-200 p-4 shadow-toy flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-500 block">花丸クリア</span>
              <span className="text-2xl sm:text-3xl font-black text-hanamaru">
                {analytics.perfectTestsCount}
                <span className="text-xs text-stone-400 ml-1">回</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-b-4 border-amber-200 p-4 shadow-toy flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center shrink-0">
              <CheckCircle className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-500 block">正解した問題</span>
              <span className="text-2xl sm:text-3xl font-black text-green-600">
                {analytics.totalCorrect}
                <span className="text-xs text-stone-400 ml-1">問</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-b-4 border-amber-200 p-4 shadow-toy flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-500 block">全体正解率</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-900">
                {analytics.overallAccuracy}
                <span className="text-xs text-stone-400 ml-1">%</span>
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border-2 border-b-4 border-amber-200 p-4 shadow-toy flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-stone-500 block">登録プリント</span>
              <span className="text-2xl sm:text-3xl font-black text-blue-800">
                {analytics.totalTests}
                <span className="text-xs text-stone-400 ml-1">枚</span>
              </span>
            </div>
          </div>
        </div>

        {/* Learning Advice Card */}
        {(strongestSubject || weakestSubject) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strongestSubject && (
              <div className="p-4 rounded-3xl bg-green-50 border-2 border-green-200 flex items-start gap-3">
                <span className="text-2xl">🌟</span>
                <div>
                  <h3 className="text-sm font-black text-green-900 mb-0.5">
                    いちばん得意な教科: {SUBJECT_METAS[strongestSubject].label}（正解率 {subjectStats[strongestSubject].accuracy}%）
                  </h3>
                  <p className="text-xs text-green-700">
                    素晴らしい実力です！この調子でどんどん難しい問題にも挑戦してみよう！
                  </p>
                </div>
              </div>
            )}
            {weakestSubject && subjectStats[weakestSubject].totalQuestions > 0 && (
              <div className="p-4 rounded-3xl bg-orange-50 border-2 border-orange-200 flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h3 className="text-sm font-black text-orange-900 mb-0.5">
                    復習がおすすめ: {SUBJECT_METAS[weakestSubject].label}（正解率 {subjectStats[weakestSubject].accuracy}%）
                  </h3>
                  <p className="text-xs text-orange-700">
                    「まちがえた問題だけ特訓」を使って、もう１回解き直してみよう！すぐ得意になるよ！
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Subject Mastery Progress Bars (5 Subjects) */}
        <div className="bg-white rounded-3xl border-3 border-amber-300 p-6 shadow-toy">
          <h2 className="text-lg font-black text-stone-800 mb-4 flex items-center gap-2">
            <span>5教科のマスター状況</span>
          </h2>

          <div className="space-y-4">
            {(Object.keys(SUBJECT_METAS) as Subject[]).map((subj) => {
              const stat = subjectStats[subj];
              const meta = SUBJECT_METAS[subj];

              return (
                <div key={subj} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <SubjectBadge subject={subj} size="sm" showHiragana />
                      <span className="text-xs font-bold text-stone-600">
                        {stat.correctQuestions} / {stat.totalQuestions} 問 正解
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {stat.perfectTests > 0 && (
                        <span className="text-xs font-black text-hanamaru flex items-center">
                          💮 {stat.perfectTests}回満点
                        </span>
                      )}
                      <span className="text-sm font-black text-stone-800">
                        {stat.accuracy}%
                      </span>
                    </div>
                  </div>

                  {/* Progress Track */}
                  <div className="w-full h-3 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stat.accuracy}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Account Info & Actions */}
        <div className="bg-white rounded-3xl border-2 border-stone-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-stone-500 block">ログインアカウント</span>
              <span className="text-sm font-black text-stone-800">
                {currentUser ? `${currentUser.name} (${currentUser.email})` : '未ログイン（ローカル保存）'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>ログアウト</span>
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => playPopSound()}
                className="px-4 py-2 rounded-xl bg-primary-yellow hover:bg-amber-400 text-amber-950 text-xs font-black border-2 border-amber-600 shadow-toy-sm flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" />
                <span>ログイン / 新規登録</span>
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
