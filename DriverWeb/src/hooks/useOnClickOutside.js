// src/hooks/useOnClickOutside.js
import { useEffect } from "react";

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // If clicking inside the element, do nothing
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      // If clicking outside, call the handler (e.g., closeMenu)
      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}