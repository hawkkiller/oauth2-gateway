import {
  findCsrfTokenInNodes,
  findEmailInNodes,
} from "@/common/ory/ui_nodes_helper";
import { verifyLoginCode } from "@/feature/auth/service/auth";
import { LoginFlow } from "@ory/kratos-client";
import { useState } from "react";

type LoginCodeSubmitState = {
  isSubmitting: boolean;
  isRedirecting: boolean;
  error: string | null;
};

export function useLoginSubmitCodeForm() {
  const [submitState, setState] = useState<LoginCodeSubmitState>({
    isSubmitting: false,
    isRedirecting: false,
    error: null,
  });

  const submitCode = async (code: string, flow: LoginFlow) => {
    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const csrf_token = findCsrfTokenInNodes(flow.ui.nodes);
      const email = findEmailInNodes(flow.ui.nodes);

      if (!csrf_token || !email) {
        throw new Error("CSRF token or email not found");
      }

      const res = await verifyLoginCode({
        flowId: flow.id,
        code,
        csrfToken: csrf_token,
        email,
      });

      console.log(res);

      window.location.href = res.redirect_browser_to;
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        isRedirecting: true,
      }));
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: error?.message || "Failed to verify login code",
      }));
    }
  };

  return { submitState, submitCode };
}
