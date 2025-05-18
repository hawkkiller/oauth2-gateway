import { getSession } from "@/feature/auth/service/auth";
import { Session } from "@ory/kratos-client";
import { useEffect, useState } from "react";

export type SessionState = {
  session: Session | null;
  isLoading: boolean;
};

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true }));
        const session = await getSession();
        setState((prev) => ({ ...prev, session: session }));
      } catch (error) {
        console.error(error);
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchSession();
  }, []);

  return state;
}
