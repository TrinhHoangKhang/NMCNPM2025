import { useState, useEffect } from "react";

// You can adjust this width (768px is standard for tablets/mobiles)
const MOBILE_BREAKPOINT = "(max-width: 768px)";

export function useMobile() {
  // Initialize with false (assume desktop first to avoid layout shift, or check window if available)
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 1. Define the media query
    const mediaQuery = window.matchMedia(MOBILE_BREAKPOINT);

    // 2. Handler function to update state
    const handleResize = (event) => {
      setIsMobile(event.matches);
    };

    // 3. Set initial value (check immediately on load)
    setIsMobile(mediaQuery.matches);

    // 4. Add Event Listener (Modern browsers)
    mediaQuery.addEventListener("change", handleResize);

    // 5. Cleanup
    return () => mediaQuery.removeEventListener("change", handleResize);
  }, []);

  return isMobile;
}