import { useState, useEffect } from 'react';
import type { DefenseProblem, DefenseSettings } from '../types';
import { getTierLabel, getTierColor } from '../utils/tier';

interface Props {
  problems: DefenseProblem[];
  settings: DefenseSettings;
  onComplete: (problems: DefenseProblem[]) => void;
  onBack: () => void;
}

export default function DefensePage({ problems, settings, onComplete, onBack }: Props) {
  const [currentProblems, setCurrentProblems] = useState(problems);
  const [elapsed, setElapsed] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleComplete = (index: number) => {
    setCurrentProblems(prev =>
      prev.map((p, i) => (i === index ? { ...p, completed: !p.completed } : p))
    );
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const timeLimit = settings.timeLimit ? settings.timeLimit * 60 : null;
  const isTimeOver = timeLimit !== null && elapsed >= timeLimit;
  const completedCount = currentProblems.filter(p => p.completed).length;
  const accuracyRate = (p: DefenseProblem) => (100 / p.averageTries).toFixed(1);

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎯 랜덤 디펜스</h1>
        <div className={`text-xl font-mono ${isTimeOver ? 'text-red-500' : ''}`}>
          ⏱ {formatTime(elapsed)}
          {timeLimit && ` / ${formatTime(timeLimit)}`}
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {currentProblems.map((problem, index) => (
          <div
            key={problem.problemId}
            className={`p-4 rounded-lg border-2 transition ${
              problem.completed
                ? 'bg-green-50 border-green-300'
                : 'bg-white border-gray-200'
            }`}
          >
            {/* 기본 정보 (항상 보임) */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-gray-500 font-medium">#{index + 1}</span>
                <span className="font-bold text-lg">{problem.problemId}</span>
                <span className="font-medium">{problem.titleKo}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`https://boj.kr/${problem.problemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
                >
                  백준 ↗
                </a>
                <button
                  onClick={() => toggleComplete(index)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    problem.completed
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {problem.completed ? '✓ 완료' : '완료'}
                </button>
              </div>
            </div>

            {/* 추가 정보 토글 버튼 */}
            <button
              onClick={() => toggleExpand(index)}
              className="mt-2 text-sm text-blue-500 hover:text-blue-700"
            >
              {expandedIndex === index ? '▲ 정보 숨기기' : '▼ 추가 정보 보기'}
            </button>

            {/* 추가 정보 (펼쳤을 때만 보임) */}
            {expandedIndex === index && (
              <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-3 text-sm">
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {problem.tagKey}
                </span>
                {!settings.hideTier && (
                  <span style={{ color: getTierColor(problem.level) }} className="font-medium">
                    ⭐ {getTierLabel(problem.level)}
                  </span>
                )}
                <span className="text-gray-500">
                  정답률 {accuracyRate(problem)}%
                </span>
                <span className="text-gray-500">
                  {problem.acceptedUserCount.toLocaleString()}명 solved
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-gray-600">
          완료: {completedCount} / {currentProblems.length}
        </span>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            ⚙ 설정으로
          </button>
          <button
            onClick={() => onComplete(currentProblems)}
            className="px-4 py-2 bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition"
          >
            디펜스 종료
          </button>
        </div>
      </div>
    </div>
  );
}