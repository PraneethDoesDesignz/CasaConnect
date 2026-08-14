import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Router keeps scroll position across navigations; reset it, except for
 *  in-page anchors like /about#contact which own their own scrolling. */
export default function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname, hash]);

  return null;
}
