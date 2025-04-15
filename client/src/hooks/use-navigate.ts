import { useCallback } from 'react';
import { useLocation } from 'wouter';

/**
 * Custom hook that provides navigation functionality
 * This solves the wouter navigation issue where useNavigate is not available
 */
export function useNavigate() {
  const [, setLocation] = useLocation();
  
  // Return a memoized navigate function
  return useCallback(
    (to: string) => setLocation(to),
    [setLocation]
  );
}