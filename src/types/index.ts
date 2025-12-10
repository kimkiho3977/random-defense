export interface Problem {
  problemId: number;
  titleKo: string;
  level: number;
  averageTries: number;
  acceptedUserCount: number;
  tags: Tag[];
}

export interface Tag {
  key: string;
  displayNames: { language: string; name: string }[];
}

export interface DefenseSettings {
  handle: string;
  count: number;
  tierMin: number;
  tierMax: number;
  tags: string[];
  solvedMin: number;
  solvedMax: number;
  rateMin: number;
  rateMax: number;
  timeLimit: number | null;
  distributeByTag: boolean;
  distributeByTier: boolean;
  hideTier: boolean;
}

export interface DefenseProblem extends Problem {
  tagKey: string;
  completed: boolean;
}

export type Page = 'setting' | 'defense' | 'result';