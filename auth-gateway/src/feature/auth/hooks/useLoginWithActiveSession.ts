import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginWithActiveSession } from "../service/auth";

export type LoginWithActiveSessionState = {
  isLoading: boolean;
  error: string | null;
};

export function useLoginWithActiveSession(loginChallenge: string) {
  const router = useRouter();
  const [state, setState] = useState<LoginWithActiveSessionState>({
    isLoading: false,
    error: null,
  });

  const $loginWithActiveSession = async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await loginWithActiveSession(loginChallenge);
      if (response.redirect_to) {
        router.push(response.redirect_to);
      }
    } catch (error) {
      console.error(error);
      setState((prev) => ({ ...prev, error: error as string }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  return {
    state,
    loginWithActiveSession: $loginWithActiveSession,
  };
}
