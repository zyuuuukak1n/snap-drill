import React from 'react';
import { Subject, SUBJECT_METAS } from '@/types';
import { BookOpen, Calculator, FlaskConical, Compass, Languages } from 'lucide-react';

interface SubjectBadgeProps {
  subject: Subject;
  size?: 'sm' | 'md' | 'lg';
  showHiragana?: boolean;
}

export const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subject,
  size = 'md',
  showHiragana = false,
}) => {
  const meta = SUBJECT_METAS[subject] || SUBJECT_METAS.japanese;

  const renderIcon = () => {
    const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4';
    switch (subject) {
      case 'japanese':
        return <BookOpen className={iconClass} />;
      case 'math':
        return <Calculator className={iconClass} />;
      case 'science':
        return <FlaskConical className={iconClass} />;
      case 'social':
        return <Compass className={iconClass} />;
      case 'english':
        return <Languages className={iconClass} />;
      default:
        return <BookOpen className={iconClass} />;
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold rounded-full border ${sizeClasses}`}
      style={{
        backgroundColor: meta.bgColor,
        color: meta.color,
        borderColor: meta.borderColor,
      }}
    >
      {renderIcon()}
      <span>{meta.label}</span>
      {showHiragana && <span className="text-xs opacity-75">（{meta.hiragana}）</span>}
    </span>
  );
};
