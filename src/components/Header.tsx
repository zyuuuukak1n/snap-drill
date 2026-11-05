'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Home, PlusCircle } from 'lucide-react';

interface HeaderProps {
  title?: string;
  showBackHome?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ title, showBackHome = false }) => {
  return (
    <header className="sticky top-0 z-30 bg-amber-100/90 backdrop-blur-md border-b-2 border-amber-300 shadow-sm">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackHome && (
            <Link
              href="/"
              className="p-2 rounded-2xl bg-white border-2 border-b-4 border-amber-400 hover:bg-amber-50 active:translate-y-0.5 active:border-b-2 transition-all flex items-center text-amber-900"
              title="トップにもどる"
            >
              <Home className="w-5 h-5 text-amber-700" />
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2 group">
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
          <Link
            href="/create"
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-yellow hover:bg-amber-400 text-amber-950 font-black rounded-2xl border-2 border-b-4 border-amber-600 shadow-toy-sm active:translate-y-0.5 active:border-b-2 transition-all text-xs sm:text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>プリント読込</span>
          </Link>
        </div>
      </div>
    </header>
  );
};
