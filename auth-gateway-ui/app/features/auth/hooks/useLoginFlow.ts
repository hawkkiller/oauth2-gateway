import * as authService from "../service/authService";
import React from "react";

export function useLoginFlow(): {
  loadLoginFlow: (
    flowId: string | null,
    challenge: string | null
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  flow: LoginFlow | null;
} {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [flow, setLoginFlow] = React.useState<LoginFlow | null>(null);

  const loadLoginFlow = async (
    flowId: string | null,
    challenge: string | null
  ) => {
    if (!flowId && !challenge) {
      setError("Invalid flow or challenge");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (challenge) {
        const loginFlow = await authService.createLoginFlow(challenge);
        setLoginFlow(loginFlow);
      }

      if (flowId) {
        const loginFlow = await authService.getLoginFlow(flowId);
        setLoginFlow(loginFlow);
      }
    } catch (error) {
      setError("Error loading login flow: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return { loadLoginFlow, isLoading, error, flow };
}
