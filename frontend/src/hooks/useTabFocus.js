import { useEffect } from 'react';

export const useTabFocus = (onTabChange) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (onTabChange) {
          onTabChange();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [onTabChange]);
};
