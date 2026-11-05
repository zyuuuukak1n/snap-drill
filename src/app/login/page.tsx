'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { playPopSound, playCorrectSound } from '@/lib/audio';
import { LogIn, Sparkles, Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'ログインに失敗しました');
      }

      playCorrectSound();
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'エラーが発生しました');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded">
      <Header />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border-3 border-amber-300 p-6 sm:p-8 shadow-toy">
          <div className="text-center mb-6">
            <span className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 inline-flex items-center justify-center text-amber-800 mb-2 shadow-inner">
              <LogIn className="w-6 h-6" />
            </span>
            <h1 className="text-2xl font-black text-amber-950">ログイン</h1>
            <p className="text-xs text-stone-500 mt-1">
              登録したメールアドレスとパスワードを入力してね！
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                メールアドレス
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-sm font-bold text-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                パスワード
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-stone-200 focus:border-amber-400 focus:outline-none text-sm font-bold text-stone-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              onClick={() => playPopSound()}
              className="w-full mt-2 py-3.5 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl border-2 border-b-4 border-primary-dark shadow-toy-sm active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2 text-sm sm:text-base disabled:opacity-50"
            >
              {loading ? (
                <span>ログイン中…</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ログインする</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-stone-100 text-center text-xs text-stone-600 flex flex-col gap-2">
            <span>はじめて使う方はこちら</span>
            <Link
              href="/register"
              onClick={() => playPopSound()}
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-black hover:bg-amber-100 transition-colors"
            >
              <UserPlus className="w-4 h-4 text-amber-700" />
              <span>新しくアカウントを作る</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
