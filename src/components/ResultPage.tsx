import type { DefenseProblem } from '../types';

interface Props {
  problems: DefenseProblem[];
  elapsedTime: number;
  onRetry: () => void;
  onBack: () => void;
}

export default function ResultPage({ problems, elapsedTime, onRetry, onBack }: Props) {
  const completedCount = problems.filter(p => p.completed).length;

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}시간 ${m}분 ${s}초`;
    }
    return `${m}분 ${s}초`;
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">🎯 디펜스 완료!</h1>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="text-center mb-4">
          <div className="text-gray-500 mb-1">총 소요 시간</div>
          <div className="text-3xl font-bold">{formatTime(elapsedTime)}</div>
        </div>
        <div className="text-center">
          <div className="text-gray-500 mb-1">완료</div>
          <div className="text-3xl font-bold">
            {completedCount} / {problems.length}
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {problems.map((problem, index) => (
          <div
            key={problem.problemId}
            className="flex items-center justify-between p-3 bg-white rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <span className="text-gray-500">#{index + 1}</span>
              <span className="font-medium">{problem.titleKo}</span>
            </div>
            <span className={problem.completed ? 'text-green-500' : 'text-red-500'}>
              {problem.completed ? '✅' : '❌'}
            </span>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onRetry}
          className="flex-1 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
        >
          🔄 다시 뽑기
        </button>
        <button
          onClick={onBack}
          className="flex-1 py-3 bg-gray-100 font-medium rounded-lg hover:bg-gray-200 transition"
        >
          ⚙ 설정으로
        </button>
      </div>
    </div>
  );
}