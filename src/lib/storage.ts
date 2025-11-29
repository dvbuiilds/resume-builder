import { createJSONStorage } from 'zustand/middleware';

/**
 * Creates a dual storage implementation that writes to both
 * localStorage and sessionStorage, and reads from localStorage
 * first, falling back to sessionStorage.
 */
export const createDualStorage = () =>
  createJSONStorage(() => {
    if (typeof window === 'undefined') {
      return {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      };
    }

    return {
      getItem: (name: string) =>
        window.localStorage.getItem(name) ??
        window.sessionStorage.getItem(name),
      setItem: (name: string, value: string) => {
        window.localStorage.setItem(name, value);
        window.sessionStorage.setItem(name, value);
      },
      removeItem: (name: string) => {
        window.localStorage.removeItem(name);
        window.sessionStorage.removeItem(name);
      },
    };
  });
