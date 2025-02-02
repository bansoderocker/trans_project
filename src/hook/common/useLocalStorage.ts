import { useState, useEffect } from "react";

function useLocalStorage<T>(
  key: string,
  initialValue: T | null = null
): [T | null, (value: T | null) => void, () => T | null] {
  const [storedValue, setStoredValue] = useState<T | null>(initialValue);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    }
  }, [key]);

  const setValue = (value: T | null) => {
    setStoredValue(value);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Method to directly get the value from localStorage
  const getValue = (): T | null => {
    if (typeof window !== "undefined") {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  };

  return [storedValue, setValue, getValue];
}

export default useLocalStorage;
