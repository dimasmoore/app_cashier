import { signOut } from "next-auth/react";
import { useState } from "react";

export interface LogoutOptions {
  callbackUrl?: string;
  redirect?: boolean;
}

/**
 * Centralized logout function with consistent error handling
 * @param options - Logout configuration options
 * @returns Promise that resolves when logout is complete
 */
export async function performLogout(options: LogoutOptions = {}) {
  const { callbackUrl = "/", redirect = true } = options;
  
  try {
    await signOut({
      callbackUrl,
      redirect
    });
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

/**
 * Hook for logout functionality with loading state management
 * @param onError - Optional error handler
 * @returns Object with logout function and loading state
 */
export function useLogout(onError?: (error: Error) => void) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async (options?: LogoutOptions) => {
    setIsLoggingOut(true);
    try {
      await performLogout(options);
    } catch (error) {
      setIsLoggingOut(false);
      if (onError) {
        onError(error as Error);
      }
    }
  };

  return { logout, isLoggingOut };
}


export { signOut } from "next-auth/react";
