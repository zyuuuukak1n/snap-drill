'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Home, PlusCircle, LogIn, LogOut, User, BarChart2 } from 'lucide-react';
import { fetchCurrentUser, AuthUser } from '@/lib/api-client';
import { playPopSound } from '@/lib/audio';

interface HeaderProps {
  title?: string;
  showBackHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBackHome = false }) => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    fetchCurrentUser().then(setCurrentUser);
  }, []);

  const handleLogout = async () => {
    playPopSound();
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-30 bg-amber-100/90 backdrop-blur-md border-b-2 border-amber-300 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackHome && (
            <Link
              href="/"
              onClick={() => playPopSound()}
              className="p-2 rounded-2xl bg-white border-2 border-b-4 border-amber-400 hover:bg-amber-50 active:translate-y-0.5 active:border-b-2 transition-all flex items-center text-amber-900"
              title="トップにもどる"
            >
              <Home className="w-5 h-5 text-amber-700" />
            </Link>
          )}
          <Link href="/" onClick={() => playPopSound()} className="flex items-center gap-2 group">
            <span className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center text-white shadow-toy-sm border-2 border-primary-dark">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </span>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight font-rounded group-hover:text-amber-800 transition-colors">
                スナップドリル
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-amber-700 tracking-wider hidden sm:block -mt-1">
                小学生の手書きテスト復習Webアプリ
              </span>
            </div>
          </Link>
        </div>

        {title && (
          <div className="text-center hidden md:block">
            <span className="text-sm font-bold text-amber-900 bg-white/70 px-4 py-1.5 rounded-full border border-amber-200">
              {title}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* MyPage link */}
          <Link
            href="/mypage"
            onClick={() => playPopSound()}
            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-white/90 text-amber-950 border-2 border-amber-300 hover:bg-amber-50 rounded-xl text-xs font-black shadow-toy-sm"
            title="マイページ・学習分析"
          >
            <BarChart2 className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline">マイページ</span>
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-stone-700 bg-white/80 px-2.5 py-1 rounded-full border border-amber-300 hidden md:inline-flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-600" />
                <span>{currentUser.name} さん</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-white border border-stone-300 text-stone-600 hover:bg-stone-100 text-xs font-bold flex items-center gap-1"
                title="ログアウト"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden md:inline">ログアウト</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              onClick={() => playPopSound()}
              className="flex items-center gap-1 px-3 py-1.5 bg-white text-stone-700 border-2 border-amber-300 hover:bg-amber-50 rounded-xl text-xs font-black shadow-toy-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ログイン</span>
            </Link>
          )}

          <Link
            href="/create"
            onClick={() => playPopSound()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-yellow hover:bg-amber-400 text-amber-950 font-black rounded-2xl border-2 border-b-4 border-amber-600 shadow-toy-sm active:translate-y-0.5 active:border-b-2 transition-all text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">プリント読込</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
