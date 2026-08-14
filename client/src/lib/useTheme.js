import { useCallback, useEffect, useState } from 'react';

const KEY = 'casaconnect:theme';
const MODES = ['system', 'light', 'dark'];

const read = () => {
  const stored = localStorage.getItem(KEY);
  return MODES.includes(stored) ? stored : 'system';
};

/** `system` removes the attribute entirely so the CSS media query takes over. */
const apply = (mode) => {
  const root = document.documentElement;
  if (mode === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
};

// Run before first paint so a forced theme does not flash the system one.
apply(read());

export default function useTheme() {
  const [mode, setMode] = useState(read);

  useEffect(() => {
    apply(mode);
    localStorage.setItem(KEY, mode);
  }, [mode]);

  // Another tab changing the preference should not leave this one stale.
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === KEY) setMode(read());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const cycle = useCallback(
    () => setMode((m) => MODES[(MODES.indexOf(m) + 1) % MODES.length]),
    []
  );

  return { mode, setMode, cycle, modes: MODES };
}
