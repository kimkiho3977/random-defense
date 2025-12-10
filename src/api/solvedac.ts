import type { Problem, Tag } from '../types';

const PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://solved.ac/api/v3';

export async function fetchTags(): Promise<Tag[]> {
  const allTags: Tag[] = [];
  let page = 1;
  
  while (true) {
    const res = await fetch(`${PROXY}${encodeURIComponent(`${BASE_URL}/tag/list?page=${page}`)}`);
    if (!res.ok) throw new Error('태그 목록을 불러오지 못했습니다');
    const data = await res.json();
    
    if (data.items.length === 0) break;
    
    allTags.push(...data.items);
    page++;
    
    if (page > 10) break;
  }
  
  return allTags;
}

interface FetchOptions {
  tag: string;
  tierMin: number;
  tierMax: number;
  handle?: string;
  solvedMin?: number;
  solvedMax?: number;
  rateMin?: number;
  rateMax?: number;
}

async function fetchWithQuery(options: FetchOptions): Promise<Problem[]> {
  const { tag, tierMin, tierMax, handle, solvedMin, solvedMax } = options;
  const queries: string[] = [];
  
  queries.push(`tag:${tag}`);
  queries.push(`tier:${tierMin}..${tierMax}`);
  
  if (handle) {
    queries.push(`!solved_by:${handle}`);
  }
  
  if (solvedMin !== undefined) {
    queries.push(`solved:${solvedMin}..`);
  }
  
  if (solvedMax !== undefined) {
    queries.push(`solved:..${solvedMax}`);
  }

  const query = encodeURIComponent(queries.join(' '));
  const url = `${BASE_URL}/search/problem?query=${query}&sort=random&page=1`;
  const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
  
  if (!res.ok) return [];
  
  const data = await res.json();
  return data.items;
}

function filterByRate(problems: Problem[], rateMin?: number, rateMax?: number): Problem[] {
  if (rateMin === undefined && rateMax === undefined) return problems;
  
  return problems.filter(p => {
    const rate = 100 / p.averageTries;
    const minOk = rateMin === undefined || rate >= rateMin;
    const maxOk = rateMax === undefined || rate <= rateMax;
    return minOk && maxOk;
  });
}

export async function fetchProblemsWithFallback(
  options: FetchOptions,
  usedIds: Set<number>
): Promise<Problem | null> {
  const { tierMin, tierMax, rateMin, rateMax } = options;

  // 1차: 원래 조건
  let problems = await fetchWithQuery(options);
  let filtered = filterByRate(problems, rateMin, rateMax).filter(p => !usedIds.has(p.problemId));
  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // 2차: 정답률 필터 해제
  filtered = problems.filter(p => !usedIds.has(p.problemId));
  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // 3차: 푼 사람 수 필터 해제
  const options3 = { ...options, solvedMin: undefined, solvedMax: undefined };
  problems = await fetchWithQuery(options3);
  filtered = filterByRate(problems, rateMin, rateMax).filter(p => !usedIds.has(p.problemId));
  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // 4차: 난이도 범위 ±2 확장
  const expandedTierMin = Math.max(1, tierMin - 2);
  const expandedTierMax = Math.min(30, tierMax + 2);
  const options4 = { ...options, tierMin: expandedTierMin, tierMax: expandedTierMax, solvedMin: undefined, solvedMax: undefined };
  problems = await fetchWithQuery(options4);
  filtered = problems.filter(p => !usedIds.has(p.problemId));
  if (filtered.length > 0) {
    return filtered[Math.floor(Math.random() * filtered.length)];
  }

  // 실패
  return null;
}

export async function checkHandle(handle: string): Promise<boolean> {
  try {
    const url = `${BASE_URL}/user/show?handle=${handle}`;
    const res = await fetch(`${PROXY}${encodeURIComponent(url)}`);
    return res.ok;
  } catch {
    return false;
  }
}