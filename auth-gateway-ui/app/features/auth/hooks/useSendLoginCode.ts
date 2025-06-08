import React from "react";
import * as authService from "../service/authService";

export function useSendLoginCode(): {
  sendLoginCode: (email: string, flow: LoginFlow) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  flow: LoginFlow | null;
} {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [flow, setFlow] = React.useState<LoginFlow | null>(null);

  const sendLoginCode = async (email: string, flow: LoginFlow) => {
    setIsLoading(true);
    setError(null);

    const newFlow = await authService.sendLoginCode(email, flow);

    setFlow(newFlow);
    setIsLoading(false);
    setError("Invalid email");
  };

  return { sendLoginCode, isLoading, flow, error };
}
