import { useCallback, useState } from 'react';

/**
 * Hook to manage boolean toggle state
 */
export function useToggle(initialValue: boolean = false): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setExplicit = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  return [value, toggle, setExplicit];
}
