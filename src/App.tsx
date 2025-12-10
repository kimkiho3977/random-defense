import { useState, useRef } from 'react';
import type { Page, DefenseSettings, DefenseProblem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchProblems, checkHandle } from './api/solvedac';
import { getTierRange } from './utils/tier';
import SettingPage from './components/SettingPage';
import DefensePage from './components/DefensePage';
import ResultPage from './components/ResultPage';

const DEFAULT_SETTINGS: DefenseSettings = {
  handle: '',
  count: 3,
  tierMin: 11,
  tierMax: 15,
  tags: [],
  solvedMin: 100,
  solvedMax: 10000,
  rateMin: 20,
  rateMax: 80,
  timeLimit: 120,
  distributeByTag: true,
  distributeByTier: true,
  hideTier: false,
};

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  const [page, setPage] = useState<Page>('setting');
  const [settings, setSettings] = useLocalStorage<DefenseSettings>('defense-settings', DEFAULT_SETTINGS);
  const [problems, setProblems] = useState<DefenseProblem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startTimeRef = useRef<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startDefense = async () => {
    setError(null);
    setLoading(true);

    try {
      // 핸들 체크
      if (settings.handle) {
        const valid = await checkHandle(settings.handle);
        if (!valid) {
          setError('존재하지 않는 핸들입니다');
          setLoading(false);
          return;
        }
      }

      if (settings.tags.length === 0) {
        setError('태그를 1개 이상 선택해주세요');
        setLoading(false);
        return;
      }

      const selectedProblems: DefenseProblem[] = [];
      const usedProblemIds = new Set<number>();

      // 태그 배분
      let tagAssignments: string[] = [];
      if (settings.distributeByTag) {
        for (let i = 0; i < settings.count; i++) {
          tagAssignments.push(settings.tags[i % settings.tags.length]);
        }
        tagAssignments = shuffle(tagAssignments);
      } else {
        for (let i = 0; i < settings.count; i++) {
          tagAssignments.push(settings.tags[Math.floor(Math.random() * settings.tags.length)]);
        }
      }

      // 난이도 배분
      let tierRanges: { min: number; max: number }[] = [];
      if (settings.distributeByTier) {
        tierRanges = getTierRange(settings.tierMin, settings.tierMax, settings.count);
        tierRanges = shuffle(tierRanges);
      } else {
        for (let i = 0; i < settings.count; i++) {
          tierRanges.push({ min: settings.tierMin, max: settings.tierMax });
        }
      }

      // 문제 가져오기
      for (let i = 0; i < settings.count; i++) {
        const tag = tagAssignments[i];
        const tier = tierRanges[i];

        const problems = await fetchProblems(
          tag,
          tier.min,
          tier.max,
          settings.handle || undefined,
          settings.solvedMin,
          settings.solvedMax
        );

        // 정답률 필터링
        const filtered = problems.filter(p => {
          const rate = 100 / p.averageTries;
          return (
            rate >= settings.rateMin &&
            rate <= settings.rateMax &&
            !usedProblemIds.has(p.problemId)
          );
        });

        if (filtered.length === 0) {
          setError(`조건에 맞는 문제가 부족합니다 (${tag})`);
          setLoading(false);
          return;
        }

        const selected = filtered[Math.floor(Math.random() * filtered.length)];
        usedProblemIds.add(selected.problemId);
        
        selectedProblems.push({
          ...selected,
          tagKey: tag,
          completed: false,
        });
      }

      setProblems(selectedProblems);
      startTimeRef.current = Date.now();
      setPage('defense');
    } catch {
      setError('문제를 불러오는 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = (updatedProblems: DefenseProblem[]) => {
    setProblems(updatedProblems);
    setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    setPage('result');
  };

  return (
    <div className="min-h-screen py-8">
      {page === 'setting' && (
        <SettingPage
          settings={settings}
          onChange={setSettings}
          onStart={startDefense}
          loading={loading}
          error={error}
        />
      )}
      {page === 'defense' && (
        <DefensePage
          problems={problems}
          settings={settings}
          onComplete={handleComplete}
          onBack={() => setPage('setting')}
        />
      )}
      {page === 'result' && (
        <ResultPage
          problems={problems}
          elapsedTime={elapsedTime}
          onRetry={startDefense}
          onBack={() => setPage('setting')}
        />
      )}
    </div>
  );
}