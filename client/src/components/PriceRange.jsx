import { useMemo } from 'react';
import { priceShort } from '../lib/format';

const BUCKETS = 22;

/**
 * Dual-handle price filter with a histogram of the listings it is filtering.
 * The bars show where the stock actually sits, so an empty range is obvious
 * before you drag into it.
 */
export default function PriceRange({ prices, min, max, value, onChange }) {
  const [lo, hi] = value;

  const bars = useMemo(() => {
    if (!prices.length || max <= min) return [];
    const counts = new Array(BUCKETS).fill(0);
    for (const p of prices) {
      const idx = Math.min(
        BUCKETS - 1,
        Math.floor(((p - min) / (max - min)) * BUCKETS)
      );
      counts[idx] += 1;
    }
    const peak = Math.max(...counts, 1);
    return counts.map((c, i) => ({
      height: c === 0 ? 0 : Math.max(0.12, c / peak),
      // A bar is "in range" when any part of its bucket falls inside it.
      inRange:
        min + ((i + 1) / BUCKETS) * (max - min) >= lo &&
        min + (i / BUCKETS) * (max - min) <= hi,
      count: c,
    }));
  }, [prices, min, max, lo, hi]);

  const pct = (v) => (max <= min ? 0 : ((v - min) / (max - min)) * 100);
  const step = Math.max(1, Math.round((max - min) / 200));

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex items-baseline justify-between'>
        <span className='label'>Price</span>
        <span className='tnum text-[0.8125rem] text-muted'>
          {priceShort(lo)} to {priceShort(hi)}
        </span>
      </div>

      <div
        aria-hidden='true'
        className='flex h-12 items-end gap-[2px]'
      >
        {bars.map((b, i) => (
          <div
            key={i}
            title={`${b.count} listing${b.count === 1 ? '' : 's'}`}
            style={{ height: `${Math.max(b.height * 100, 3)}%` }}
            className={`flex-1 rounded-[2px] transition-colors duration-200 ${
              b.count === 0
                ? 'bg-line'
                : b.inRange
                ? 'bg-accent'
                : 'bg-line'
            }`}
          />
        ))}
      </div>

      <div className='relative h-5'>
        <div className='absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line' />
        <div
          className='absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-accent'
          style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }}
        />
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={lo}
          aria-label='Minimum price'
          onChange={(e) => onChange([Math.min(+e.target.value, hi), hi])}
          className='range'
        />
        <input
          type='range'
          min={min}
          max={max}
          step={step}
          value={hi}
          aria-label='Maximum price'
          onChange={(e) => onChange([lo, Math.max(+e.target.value, lo)])}
          className='range'
        />
      </div>
    </div>
  );
}
