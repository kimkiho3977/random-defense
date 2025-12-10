export const TIERS = [
  { value: 6, label: 'S5', color: '#435F7A' },
  { value: 7, label: 'S4', color: '#435F7A' },
  { value: 8, label: 'S3', color: '#435F7A' },
  { value: 9, label: 'S2', color: '#435F7A' },
  { value: 10, label: 'S1', color: '#435F7A' },
  { value: 11, label: 'G5', color: '#EC9A00' },
  { value: 12, label: 'G4', color: '#EC9A00' },
  { value: 13, label: 'G3', color: '#EC9A00' },
  { value: 14, label: 'G2', color: '#EC9A00' },
  { value: 15, label: 'G1', color: '#EC9A00' },
  { value: 16, label: 'P5', color: '#27E2A4' },
  { value: 17, label: 'P4', color: '#27E2A4' },
  { value: 18, label: 'P3', color: '#27E2A4' },
];

export function getTierLabel(level: number): string {
  const tier = TIERS.find(t => t.value === level);
  return tier?.label ?? `Lv.${level}`;
}

export function getTierColor(level: number): string {
  const tier = TIERS.find(t => t.value === level);
  return tier?.color ?? '#888';
}

export function getTierRange(min: number, max: number, count: number): { min: number; max: number }[] {
  const range = max - min + 1;
  const segmentSize = Math.floor(range / count);
  const ranges: { min: number; max: number }[] = [];

  for (let i = 0; i < count; i++) {
    const segMin = min + i * segmentSize;
    const segMax = i === count - 1 ? max : segMin + segmentSize - 1;
    ranges.push({ min: segMin, max: segMax });
  }

  return ranges;
}