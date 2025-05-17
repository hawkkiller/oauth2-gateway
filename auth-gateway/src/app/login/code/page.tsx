"use client";

import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  findEmailInNodes
} from "@/common/ory/ui_nodes_helper";
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
import { FlowError } from "@/feature/auth/components/flowError";
import { useLoginFlow } from "@/feature/auth/hooks/useLoginFlow";
import { useLoginSubmitCodeForm } from "@/feature/auth/hooks/useLoginSubmitCodeForm";

/**
 * OTP verification page component
 * Handles verification of the one-time password sent to users during login
 */
export default function OTPSubmitPage() {
  // Router and params
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");

  const flowState = useLoginFlow(flowId, null);
  const flowEmail = findEmailInNodes(flowState.flow?.ui?.nodes || []);

  const [code, setCode] = useState("");
  const { submitState, submitCode } = useLoginSubmitCodeForm();
  const isProcessing = submitState.isSubmitting || submitState.isRedirecting;

  // Handle OTP verification submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!flowState.flow) {
      return;
    }

    await submitCode(code, flowState.flow!);
  };

  // Update code in state
  const handleCodeChange = (code: string) => {
    setCode(code);
  };

  if (flowState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-lg border-0 py-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">Loading login form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (flowState.error) {
    return <FlowError error={flowState.error} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center font-bold">
            Verification Code
          </CardTitle>
          <CardDescription className="text-center">
            Enter the 6-digit code sent to {flowEmail || "your email"}
          </CardDescription>
        </CardHeader>

        <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={handleCodeChange}
                disabled={isProcessing}
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

            {submitState.error && <ErrorMessage message={submitState.error} />}
          </CardContent>

          <CardFooter className="flex flex-col space-y-5">
            <Button
              type="submit"
              className="w-full font-medium h-11 transition-all"
              disabled={isProcessing || code.length < 6}
            >
              {submitState.isSubmitting || submitState.isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {submitState.isRedirecting
                    ? "Redirecting..."
                    : "Verifying..."}
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
                  // TODO: Add login challenge to the URL
                  onClick={() => router.push(`/login`)}
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                  disabled={isProcessing}
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
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="border-b bg-destructive/10">
          <CardTitle className="text-2xl text-center w-full py-3 flex items-center justify-center gap-2 text-destructive">
            <AlertCircle className="w-6 h-6" />
            Invalid Login Flow
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 px-6">
          <div className="text-center text-foreground space-y-4">
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
