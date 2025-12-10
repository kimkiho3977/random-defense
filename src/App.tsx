import { useState, useRef } from 'react';
import type { Page, DefenseSettings, DefenseProblem } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { fetchProblemsWithFallback, checkHandle } from './api/solvedac';
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
      const failedTags: string[] = [];

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

        const problem = await fetchProblemsWithFallback(
          {
            tag,
            tierMin: tier.min,
            tierMax: tier.max,
            handle: settings.handle || undefined,
            solvedMin: settings.solvedMin,
            solvedMax: settings.solvedMax,
            rateMin: settings.rateMin,
            rateMax: settings.rateMax,
          },
          usedProblemIds
        );

        if (problem) {
          usedProblemIds.add(problem.problemId);
          selectedProblems.push({
            ...problem,
            tagKey: tag,
            completed: false,
          });
        } else {
          failedTags.push(tag);
        }
      }

      // 실패한 태그가 있으면 다른 태그로 대체 시도
      for (const failedTag of failedTags) {
        const otherTags = settings.tags.filter(t => t !== failedTag);
        if (otherTags.length === 0) continue;

        for (const altTag of otherTags) {
          const problem = await fetchProblemsWithFallback(
            {
              tag: altTag,
              tierMin: settings.tierMin,
              tierMax: settings.tierMax,
              handle: settings.handle || undefined,
              solvedMin: settings.solvedMin,
              solvedMax: settings.solvedMax,
              rateMin: settings.rateMin,
              rateMax: settings.rateMax,
            },
            usedProblemIds
          );

          if (problem) {
            usedProblemIds.add(problem.problemId);
            selectedProblems.push({
              ...problem,
              tagKey: altTag,
              completed: false,
            });
            break;
          }
        }
      }

      if (selectedProblems.length === 0) {
        setError('조건에 맞는 문제를 찾을 수 없습니다. 조건을 완화해주세요.');
        setLoading(false);
        return;
      }

      setProblems(shuffle(selectedProblems));
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