import { useEffect, useState } from 'react';

/** Eased count-up from 0 to target — the "weight of wealth" moment when the app opens. */
export function useCountUp(target: number, ms = 1700, delay = 150) {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / ms);
      setV(target * (1 - Math.pow(2, -10 * p)) * (p === 1 ? 1 : 1));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setV(target);
    };
    const to = setTimeout(() => { raf = requestAnimationFrame(tick); }, delay);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [target, ms, delay]);
  return v;
}
