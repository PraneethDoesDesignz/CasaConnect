import { useCallback, useEffect, useState } from 'react';

const KEY = 'casaconnect:saved';

const read = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Components across the tree need the same list, and `storage` events only
// fire in *other* tabs. A tiny event bus keeps this tab in sync too.
const listeners = new Set();
const broadcast = (ids) => listeners.forEach((fn) => fn(ids));

export default function useSaved() {
  const [ids, setIds] = useState(read);

  useEffect(() => {
    const onLocal = (next) => setIds(next);
    const onStorage = (e) => {
      if (e.key === KEY) setIds(read());
    };
    listeners.add(onLocal);
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(onLocal);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const toggle = useCallback((id) => {
    const current = read();
    const next = current.includes(id)
      ? current.filter((x) => x !== id)
      : [...current, id];
    localStorage.setItem(KEY, JSON.stringify(next));
    broadcast(next);
  }, []);

  const isSaved = useCallback((id) => ids.includes(id), [ids]);

  const clear = useCallback(() => {
    localStorage.setItem(KEY, '[]');
    broadcast([]);
  }, []);

  return { ids, count: ids.length, isSaved, toggle, clear };
}
