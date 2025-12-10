import type { DefenseSettings } from '../types';
import { TIERS } from '../utils/tier';
import TagSelector from './TagSelector';

interface Props {
  settings: DefenseSettings;
  onChange: (settings: DefenseSettings) => void;
  onStart: () => void;
  loading: boolean;
  error: string | null;
}

export default function SettingPage({ settings, onChange, onStart, loading, error }: Props) {
  const update = <K extends keyof DefenseSettings>(key: K, value: DefenseSettings[K]) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">🎯 랜덤 디펜스</h1>

      <div className="space-y-6">
        {/* solved.ac 핸들 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            solved.ac 핸들 (선택)
          </label>
          <input
            type="text"
            value={settings.handle}
            onChange={e => update('handle', e.target.value)}
            placeholder="solved.ac 아이디 (예: kiho123)"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>

        {/* 문제 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">문제 수</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => update('count', n)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  settings.count === n
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* 난이도 범위 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">난이도 범위</label>
          <div className="flex items-center gap-3">
            <select
              value={settings.tierMin}
              onChange={e => update('tierMin', Number(e.target.value))}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIERS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <span className="text-gray-500">~</span>
            <select
              value={settings.tierMax}
              onChange={e => update('tierMax', Number(e.target.value))}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIERS.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 유형 태그 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">유형 태그</label>
          <TagSelector
            selectedTags={settings.tags}
            onChange={tags => update('tags', tags)}
          />
        </div>

        {/* 푼 사람 수 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">푼 사람 수</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={settings.solvedMin}
              onChange={e => update('solvedMin', Number(e.target.value))}
              placeholder="최소"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">~</span>
            <input
              type="number"
              value={settings.solvedMax}
              onChange={e => update('solvedMax', Number(e.target.value))}
              placeholder="최대"
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 정답률 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">정답률 (%)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={settings.rateMin}
              onChange={e => update('rateMin', Number(e.target.value))}
              min={0}
              max={100}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-500">~</span>
            <input
              type="number"
              value={settings.rateMax}
              onChange={e => update('rateMax', Number(e.target.value))}
              min={0}
              max={100}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* 제한 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">제한 시간</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={settings.timeLimit ?? ''}
              onChange={e => update('timeLimit', e.target.value ? Number(e.target.value) : null)}
              placeholder="분"
              disabled={settings.timeLimit === null}
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
            />
            <span className="text-gray-500">분</span>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.timeLimit === null}
                onChange={e => update('timeLimit', e.target.checked ? null : 60)}
                className="w-4 h-4"
              />
              <span className="text-sm">무제한</span>
            </label>
          </div>
        </div>

        {/* 옵션 체크박스 */}
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.distributeByTag}
              onChange={e => update('distributeByTag', e.target.checked)}
              className="w-4 h-4"
            />
            <span>유형별 균등 배분</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.distributeByTier}
              onChange={e => update('distributeByTier', e.target.checked)}
              className="w-4 h-4"
            />
            <span>난이도 균등 배분</span>
          </label>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        {/* 시작 버튼 */}
        <button
          onClick={onStart}
          disabled={loading || settings.tags.length === 0}
          className="w-full py-4 bg-blue-500 text-white text-lg font-bold rounded-lg hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? '문제 불러오는 중...' : '🎲 디펜스 시작'}
        </button>
      </div>
    </div>
  );
}