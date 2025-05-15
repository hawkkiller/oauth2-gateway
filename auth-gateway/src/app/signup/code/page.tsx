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
import { RegistrationFlow } from "@ory/kratos-client";
import {
  findCsrfTokenInNodes,
  findEmailInNodes,
} from "@/common/ory/ui_nodes_helper";

export default function SignupOTPSubmitPage() {
  const [state, setState] = useState({
    code: "",
    flow: null as RegistrationFlow | null,
    isLoading: false,
    isRedirecting: false,
    error: null as string | null,
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");
  const login_challenge = searchParams.get("login_challenge");

  useEffect(() => {
    const fetchFlow = async () => {
      if (!flowId) return;
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const res = await fetch(`/api/signup/flow?id=${flowId}`);
        if (!res.ok) {
          throw new Error("Failed to fetch signup flow");
        }
        const data = await res.json();
        setState((prev) => ({
          ...prev,
          flow: data,
          isLoading: false,
        }));
      } catch (err: any) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: err?.message || "Failed to fetch signup flow",
        }));
      }
    };
    fetchFlow();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!state.flow || !flowId) {
      setState((prev) => ({ ...prev, error: "Signup flow not found" }));
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const csrf_token = findCsrfTokenInNodes(state.flow.ui.nodes);
      const email = findEmailInNodes(state.flow.ui.nodes);

      console.log("csrf_token", csrf_token);
      console.log("email", email);
      console.log(state.flow.ui.nodes);

      if (!csrf_token || !email) {
        throw new Error("CSRF token or email not found");
      }

      const res = await fetch(`/api/signup/code/verify?flow=${flowId}`, {
        method: "POST",
        body: JSON.stringify({
          code: state.code,
          csrf_token,
          email,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to verify code");
      }

      const data = await res.json();

      window.location.href = `/login?login_challenge=${login_challenge}`;
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err?.message || "Failed to verify code. Please try again.",
      }));
    }
  };

  const handleCodeChange = (code: string) => {
    setState((prev) => ({ ...prev, code }));
  };

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
              disabled={
                state.isLoading || state.isRedirecting || state.code.length < 6
              }
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div
      className="text-red-600 text-sm flex items-center gap-1 p-2 bg-red-50 rounded"
      role="alert"
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function InvalidFlowError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Invalid Signup Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center">
            The signup flow is invalid or missing. Please try again.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
