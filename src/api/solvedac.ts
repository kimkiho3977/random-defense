import type { Problem, Tag } from '../types';

const PROXY = 'https://corsproxy.io/?';
const BASE_URL = 'https://solved.ac/api/v3';

export async function fetchTags(): Promise<Tag[]> {
  const res = await fetch(`${PROXY}${encodeURIComponent(`${BASE_URL}/tag/list?page=1`)}`);
  if (!res.ok) throw new Error('태그 목록을 불러오지 못했습니다');
  const data = await res.json();
  return data.items;
}

export async function fetchProblems(
  tag: string,
  tierMin: number,
  tierMax: number,
  handle?: string,
  solvedMin?: number,
  solvedMax?: number
): Promise<Problem[]> {
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
  
  if (!res.ok) throw new Error('문제를 불러오지 못했습니다');
  
  const data = await res.json();
  return data.items;
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