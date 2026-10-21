import { MAX_IMPACT_SPEED } from '../api/types';
import type { Mood } from '../api/types';

export function Dash() {
  return (
    <span className="null" aria-label="нет значения">
      —
    </span>
  );
}

export function Flag({ value }: { value: boolean | null | undefined }) {
  if (value === null || value === undefined) return <Dash />;
  return (
    <span className="flag" role="img" aria-label={value ? 'да' : 'нет'}>
      {value ? '●' : '○'}
    </span>
  );
}

const MOOD_LEVEL: Record<Mood, number> = { SORROW: 1, GLOOM: 2, RAGE: 3 };

export function MoodScale({ mood }: { mood: Mood | null | undefined }) {
  if (!mood) return <Dash />;
  const level = MOOD_LEVEL[mood] ?? 0;
  const dots = [1, 2, 3].map((n) => (n <= level ? '●' : '○')).join('');
  return (
    <span className="mood">
      <span className="dots" aria-hidden="true">
        {dots}
      </span>
      {mood}
    </span>
  );
}

export function ImpactSpeed({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <Dash />;
  const percent = Math.min(100, Math.max(0, (value / MAX_IMPACT_SPEED) * 100));
  return (
    <span className="speed">
      <span className="speed-value">{value}</span>
      <span className="speed-bar" aria-hidden="true">
        <span style={{ width: `${percent}%` }} />
      </span>
    </span>
  );
}

export function Text({ value }: { value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === '') return <Dash />;
  return <>{value}</>;
}
