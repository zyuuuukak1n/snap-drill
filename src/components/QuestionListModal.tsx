'use client';

import React from 'react';
import { TestSet, Question } from '@/types';
import { SubjectBadge } from './SubjectBadge';
import { X, CheckCircle, RotateCcw, HelpCircle, PenTool, Play } from 'lucide-react';
import Link from 'next/link';
import { playPopSound } from '@/lib/audio';

interface QuestionListModalProps {
  testSet: TestSet | null;
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionListModal: React.FC<QuestionListModalProps> = ({
  testSet,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !testSet) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border-3 border-amber-300 w-full max-w-2xl max-h-[85vh] flex flex-col shadow-toy overflow-hidden font-rounded">
        {/* Header */}
        <div className="px-5 py-4 bg-amber-50 border-b-2 border-amber-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SubjectBadge subject={testSet.subject} size="sm" />
            <h2 className="text-base sm:text-lg font-black text-amber-950 truncate max-w-xs sm:max-w-md">
              {testSet.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-500 hover:bg-stone-100"
            title="とじる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          <div className="text-xs font-bold text-stone-500 flex items-center justify-between">
            <span>全 {testSet.questions.length} 問の問題一覧</span>
            <span>登録日: {new Date(testSet.createdAt).toLocaleDateString('ja-JP')}</span>
          </div>

          <div className="space-y-3">
            {testSet.questions.map((q, idx) => {
              const isCorrect = q.status === 'correct';
              const isIncorrect = q.status === 'incorrect';

              return (
                <div
                  key={q.id || idx}
                  className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/30 hover:bg-amber-50/70 transition-colors flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                        第 {q.number || idx + 1} 問
                      </span>
                      {isCorrect && (
                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> できた！💮
                        </span>
                      )}
                      {isIncorrect && (
                        <span className="text-xs font-bold text-orange-600 flex items-center gap-1">
                          <RotateCcw className="w-3.5 h-3.5" /> もう１回
                        </span>
                      )}
                      {q.status === 'unanswered' && (
                        <span className="text-xs font-bold text-stone-400">
                          未回答
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-stone-900 mb-1">
                      {q.prompt}
                    </h4>

                    {q.subPrompt && (
                      <p className="text-xs text-amber-800 font-semibold mb-1">
                        💡 {q.subPrompt}
                      </p>
                    )}

                    <div className="text-xs text-stone-600 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      <span>模範解答: <strong className="text-green-700 font-bold">{q.answer}</strong></span>
                      {q.explanation && (
                        <span className="text-stone-500">（{q.explanation}）</span>
                      )}
                    </div>
                  </div>

                  {/* Previous Handwriting Drawing Preview */}
                  {q.userDrawing && (
                    <div className="shrink-0 flex flex-col items-center">
                      <span className="text-[10px] font-bold text-stone-400 mb-1 flex items-center gap-1">
                        <PenTool className="w-3 h-3" /> 前回の手書き
                      </span>
                      <div className="w-20 h-20 rounded-xl border-2 border-amber-300 bg-white overflow-hidden shadow-sm flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={q.userDrawing}
                          alt="手書き回答"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-amber-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100"
          >
            とじる
          </button>
          <Link
            href={`/test/${testSet.id}`}
            onClick={() => {
              playPopSound();
              onClose();
            }}
            className="px-5 py-2.5 bg-primary-yellow hover:bg-amber-400 text-amber-950 font-black rounded-xl border-2 border-b-4 border-amber-600 text-xs sm:text-sm flex items-center gap-1.5 shadow-toy-sm active:translate-y-0.5 active:border-b-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>このテストを練習する</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
