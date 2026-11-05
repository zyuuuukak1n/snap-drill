'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { saveTestSetUnified, fetchCurrentUser } from '@/lib/api-client';
import { playPopSound, playCorrectSound } from '@/lib/audio';
import { TestSet, Subject, SUBJECT_METAS } from '@/types';
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Loader2,
  AlertCircle,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export default function CreateTestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('ファイルサイズが大きすぎます。10MB以下の画像を選んでください。');
      return;
    }

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('非対応の画像形式です。JPEG、PNG、またはWebP画像を選択してください。');
      return;
    }

    playPopSound();
    setErrorMessage(null);
    setSelectedFile(file);

    // Generate local preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setErrorMessage(null);
    setLoadingStep('プリントをアップロード中…');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Animation steps for kid-friendly feedback
      setTimeout(() => {
        setLoadingStep('AIがプリントの赤ペン採点や手書き文字を分析しています…✨');
      }, 1200);

      setTimeout(() => {
        setLoadingStep('元の印刷問題と模範解答を抽出しています…📝');
      }, 3000);

      const res = await fetch('/api/extract-test', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'プリントの読み取りに失敗しました。');
      }

      setLoadingStep('かんせい！テスト演習をはじめます💮');
      playCorrectSound();

      const newTest: TestSet = json.data;
      // Also save preview data URL as source image if desired
      if (previewUrl) {
        newTest.sourceImageUrl = previewUrl;
      }

      const user = await fetchCurrentUser();
      await saveTestSetUnified(newTest, !!user);

      // Redirect to practice screen
      setTimeout(() => {
        router.push(`/test/${newTest.id}`);
      }, 800);
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error ? err.message : 'エラーが発生しました。もう一度お試しください。';
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF7] flex flex-col font-rounded">
      <Header title="プリントをよみこむ" showBackHome />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl border-3 border-amber-300 p-6 sm:p-8 shadow-toy">
          <div className="text-center mb-6">
            <span className="inline-flex p-3 rounded-2xl bg-amber-100 text-amber-900 mb-2 border border-amber-300">
              <Camera className="w-8 h-8 text-amber-700" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-amber-950">
              プリントを撮影または選択
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              テストや宿題プリントの写真を撮ると、AIが自動で問題を作ってくれます。
              <br />
              赤ペンで丸付けされたプリントでも大丈夫！自動で綺麗なテストにします。
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 text-red-800 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm font-bold leading-relaxed">
                {errorMessage}
              </div>
            </div>
          )}

          {/* Hidden File Inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Dropzone / Preview Area */}
          {!previewUrl ? (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 my-6">
              {/* Camera Button */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full sm:w-1/2 p-8 rounded-3xl border-3 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex flex-col items-center justify-center text-center group active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <span className="text-base font-black text-amber-950 mb-1">
                  カメラで撮影する
                </span>
                <span className="text-xs text-stone-500">
                  Chromebookのカメラでパシャリ
                </span>
              </button>

              {/* File Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-1/2 p-8 rounded-3xl border-3 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex flex-col items-center justify-center text-center group active:scale-95"
              >
                <div className="w-16 h-16 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8" />
                </div>
                <span className="text-base font-black text-amber-950 mb-1">
                  画像ファイルを選ぶ
                </span>
                <span className="text-xs text-stone-500">
                  保存済みの写真を選択
                </span>
              </button>
            </div>
          ) : (
            <div className="my-6">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-stone-100 max-h-[420px] flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="選択されたプリントプレビュー"
                  className="max-h-[400px] w-auto object-contain mx-auto"
                />
                {!loading && (
                  <button
                    type="button"
                    onClick={() => {
                      playPopSound();
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/80 text-white text-xs font-bold transition-colors"
                  >
                    べつの写真にする
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Animation Box */}
          {loading && (
            <div className="my-6 p-6 rounded-3xl bg-amber-50 border-2 border-amber-300 text-center animate-pulse">
              <div className="inline-flex p-4 rounded-full bg-primary-yellow text-amber-950 mb-3 shadow-toy-sm animate-spin">
                <Loader2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-amber-950 mb-1">
                {loadingStep}
              </h3>
              <p className="text-xs text-stone-500">
                AIががんばって問題を作っています。少し待っててね！
              </p>
            </div>
          )}

          {/* Action Button */}
          {previewUrl && !loading && (
            <div className="flex flex-col gap-3 mt-6">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-4 px-6 bg-primary hover:bg-primary-hover text-white font-black rounded-2xl border-2 border-b-6 border-primary-dark shadow-toy active:translate-y-1 active:border-b-2 transition-all flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <Sparkles className="w-5 h-5" />
                <span>AIで問題をつくる！</span>
              </button>
            </div>
          )}

          {/* Advice / Tips Box */}
          <div className="mt-8 pt-6 border-t border-amber-100 flex items-start gap-3 text-stone-500 text-xs">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-stone-700">キレイに読み取るコツ:</strong>
              <br />
              プリント全体が明るい場所で、影が入らないように真上からまっすぐ撮影するときれいに問題が読み取れます。
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

