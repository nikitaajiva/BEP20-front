/**
 * Safely accesses localStorage in a Next.js/SSR environment.
 */
const safeStorage = {
  getItem: (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.error("Error accessing localStorage:", e);
        return null;
      }
    }
    return null;
  },
  setItem: (key, value) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
      } catch (e) {
        console.error("Error setting localStorage:", e);
      }
    }
  },
  removeItem: (key) => {
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (e) {
        console.error("Error removing from localStorage:", e);
      }
    }
  }
};

export default safeStorage;
