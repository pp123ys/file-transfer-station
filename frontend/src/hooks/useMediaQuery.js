import { useState, useEffect } from 'react';

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (event) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [query]);

  return matches;
}

function useIsMobile() {
  return useMediaQuery('(max-width: 767px)');
}

function useIsTablet() {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

export { useMediaQuery, useIsMobile, useIsTablet, useIsDesktop };
