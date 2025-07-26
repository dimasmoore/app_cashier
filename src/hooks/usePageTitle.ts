import { useEffect } from "react";

/**
 * Custom hook to set dynamic page titles
 * @param title - The page title (without the "POS System" suffix)
 * @param suffix - Optional custom suffix (defaults to "POS System")
 */
export const usePageTitle = (title: string, suffix: string = "POS System") => {
  useEffect(() => {
    const fullTitle = `${title} - ${suffix}`;
    document.title = fullTitle;
    
    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = suffix;
    };
  }, [title, suffix]);
};

export default usePageTitle;
