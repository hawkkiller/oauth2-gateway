import {
  createLoginFlow,
  getLoginFlow,
} from "@/feature/auth/service/auth";
import { LoginFlow } from "@ory/kratos-client";
import { useEffect, useState } from "react";

export type LoginFlowState = {
  flow: LoginFlow | null;
  isLoading: boolean;
  error: string | null;
};

export function useLoginFlow(
  flowId: string | null,
  loginChallenge: string | null
): LoginFlowState {
  const [state, setState] = useState<LoginFlowState>({
    flow: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    const getFlow = async () => {
      try {
        // If no flow ID is provided, create a new login flow with the login challenge
        if (!flowId && loginChallenge) {
          const res = await createLoginFlow(loginChallenge);
          setState({
            flow: res,
            isLoading: false,
            error: null,
          });
          return;
        }

        if (!flowId) {
          throw new Error("Flow ID is required");
        }

        const data = await getLoginFlow(flowId);
        setState({
          flow: data,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        setState({
          flow: null,
          isLoading: false,
          error: err.message || "Error fetching login flow",
        });
      }
    };

    getFlow();
  }, [flowId]);

  return state;
}
