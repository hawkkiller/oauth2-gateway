"use client";

import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  LoginFlow,
  UiNodeInputAttributes,
  UiNodeTypeEnum,
} from "@ory/kratos-client";
import {
  findCsrfTokenInNodes,
  findEmailInNodes,
} from "@/common/ory/ui_nodes_helper";

/**
 * OTP verification page component
 * Handles verification of the one-time password sent to users during login
 */
export default function OTPSubmitPage() {
  // Single state management object
  const [state, setState] = useState({
    code: "",
    flow: null as LoginFlow | null,
    isLoading: false,
    isRedirecting: false,
    error: null as string | null,
  });

  // Router and params
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");
  const login_challenge = searchParams.get("login_challenge");

  // Fetch login flow on component mount
  useEffect(() => {
    const fetchFlow = async () => {
      if (!flowId) return;

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const res = await fetch(`/api/login/flow?id=${flowId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch login flow");
        }
        const data = await res.json();
        setState(prev => ({ 
          ...prev, 
          flow: data, 
          isLoading: false 
        }));
      } catch (err: any) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: err?.message || "Failed to fetch login flow"
        }));
      }
    };

    fetchFlow();
  }, []);

  // Handle OTP verification submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!state.flow || !flowId) {
      setState(prev => ({ ...prev, error: "Login flow not found" }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Find CSRF token from login flow
      const csrf_token = findCsrfTokenInNodes(state.flow.ui.nodes);
      const email = findEmailInNodes(state.flow.ui.nodes);

      if (!csrf_token || !email) {
        throw new Error("CSRF token or email not found");
      }

      const res = await fetch(`/api/login/code/verify?flow=${flowId}`, {
        method: "POST",
        body: JSON.stringify({
          code: state.code,
          csrf_token,
          email,
        }),
      });

      const { redirect_browser_to } = await res.json();

      if (redirect_browser_to) {
        setState(prev => ({ ...prev, isLoading: false, isRedirecting: true }));
        window.location.href = redirect_browser_to;
        return;
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false,
        error: "Something went wrong" 
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err?.message || "Failed to verify code. Please try again."
      }));
    }
  };

  // Update code in state
  const handleCodeChange = (code: string) => {
    setState(prev => ({ ...prev, code }));
  };

  // Show error page if required parameters are missing
  if (!flowId) {
    return <InvalidFlowError />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center font-bold">
            Verification Code
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to your email
          </CardDescription>
        </CardHeader>

        <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={state.code}
                onChange={handleCodeChange}
                disabled={state.isLoading || state.isRedirecting}
                containerClassName="justify-center gap-2"
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="w-12 h-12 text-lg border-2 focus:border-primary"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>

            {state.error && <ErrorMessage message={state.error} />}
          </CardContent>

          <CardFooter className="flex flex-col space-y-5">
            <Button
              type="submit"
              className="w-full font-medium h-11 transition-all"
              disabled={state.isLoading || state.isRedirecting || state.code.length < 6}
            >
              {state.isLoading || state.isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {state.isRedirecting ? "Redirecting..." : "Verifying..."}
                </>
              ) : (
                <>
                  Verify Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex flex-col gap-2 text-center text-sm">
              <div>
                <button
                  type="button"
                  onClick={() => router.push(`/login?login_challenge=${login_challenge}`)}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                  disabled={state.isLoading || state.isRedirecting}
                >
                  ← Back to login
                </button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

/**
 * Error message component
 */
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="text-destructive text-sm flex items-center gap-2 p-3 bg-destructive/10 rounded-md">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

/**
 * Invalid flow error component displayed when required parameters are missing
 */
function InvalidFlowError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="border-b bg-red-50">
          <CardTitle className="text-2xl text-center w-full py-3 flex items-center justify-center gap-2 text-red-700">
            <AlertCircle className="w-6 h-6" />
            Invalid Login Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          <div className="text-center text-gray-700 space-y-4">
            <div className="text-5xl mb-4 flex justify-center">🔒</div>
            <p className="text-lg font-medium">
              The login flow is invalid or has expired.
            </p>
            <p className="pb-4">
              Please restart the login process from the application you were
              using.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
