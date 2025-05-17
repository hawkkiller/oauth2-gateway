// hooks/useLoginSubmit.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { findCsrfTokenInNodes } from "@/common/ory/ui_nodes_helper";
import { LoginFlow } from "@ory/kratos-client";
import { requestLoginCode } from "@/feature/auth/service/auth";

type SubmitState = {
  isSubmitting: boolean;
  isRedirecting: boolean;
  error: string | null;
};

export function useLoginSubmitEmailForm() {
  const router = useRouter();
  const [submitState, setSubmitState] = useState<SubmitState>({
    isSubmitting: false,
    isRedirecting: false,
    error: null,
  });

  const submitEmail = async (email: string, flow: LoginFlow) => {
    // Reset errors and set loading
    setSubmitState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));

    try {
      const csrfToken = findCsrfTokenInNodes(flow.ui.nodes);

      if (!csrfToken) {
        throw new Error("CSRF token not found");
      }

      // Request login code
      await requestLoginCode(flow.id, email, csrfToken);

      // Set redirecting state and navigate
      setSubmitState((prev) => ({
        ...prev,
        isSubmitting: false,
        isRedirecting: true,
        error: null,
      }));

      router.replace(`/login/code?flow=${flow.id}`);
    } catch (err: any) {
      setSubmitState({
        isSubmitting: false,
        isRedirecting: false,
        error: err.message || "Authentication failed",
      });
    }
  };

  return {
    submitState,
    submitEmail,
  };
}
