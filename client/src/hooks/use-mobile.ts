import { useState, useEffect } from "react";

/**
 * A hook that returns whether the current device is a mobile device.
 * 
 * @returns A boolean indicating whether the current device is a mobile device.
 */
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the window object is available (client-side)
    if (typeof window !== "undefined") {
      const checkIfMobile = () => {
        const width = window.innerWidth;
        setIsMobile(width < 768); // Common breakpoint for mobile devices
      };

      // Check immediately
      checkIfMobile();

      // Add event listener for resize
      window.addEventListener("resize", checkIfMobile);

      // Cleanup
      return () => {
        window.removeEventListener("resize", checkIfMobile);
      };
    }
  }, []);

  return isMobile;
}

export default useMobile;
