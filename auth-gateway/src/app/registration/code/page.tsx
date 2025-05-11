"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";

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
  RegistrationFlow,
  UiNodeInputAttributes,
  UiNodeTypeEnum,
} from "@ory/kratos-client";

/**
 * OTP verification page component for registration
 * Handles verification of the one-time password sent to users during registration
 */
export default function RegistrationOTPSubmitPage() {
  // State management
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationFlow, setRegistrationFlow] = useState<RegistrationFlow | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Router and params
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get required parameters
  const flow = searchParams.get("flow");
  const login_challenge = searchParams.get("login_challenge");
  const email = sessionStorage.getItem("email");

  // Fetch registration flow on component mount
  useEffect(() => {
    const fetchFlow = async () => {
      if (!flow) return;

      try {
        const res = await fetch(`/api/registration/flow?id=${flow}`);
        if (!res.ok) {
          throw new Error("Failed to fetch registration flow");
        }
        const data = await res.json();
        setRegistrationFlow(data);
      } catch (err: any) {
        setError(err?.message || "Failed to fetch registration flow");
      }
    };

    fetchFlow();
  }, [flow]);

  // Handle OTP verification submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!registrationFlow) {
      setError("Registration flow not found");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Find CSRF token from registration flow
      const csrf_attributes = registrationFlow.ui.nodes.find(
        (node) =>
          node.type === UiNodeTypeEnum.Input &&
          (node.attributes as UiNodeInputAttributes).name === "csrf_token"
      )?.attributes as UiNodeInputAttributes;

      // Submit verification request
      const res = await fetch(`/api/registration/code/verify?flow=${flow}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          csrf_token: csrf_attributes.value,
          login_challenge,
          email,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to verify code");
      }

      const data = await res.json();

      // Handle successful verification with redirect
      setRedirecting(true);
      router.push(data.redirect_to || "/");
    } catch (err: any) {
      setError(err?.message || "Verification failed");
      setLoading(false);
    }
  };

  // Show error page if required parameters are missing
  if (!flow || !login_challenge || !email) {
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
            Enter the 6-digit code sent to{" "}
            <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>

        <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center py-2">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={setCode}
                disabled={loading || redirecting}
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

            {error && <ErrorMessage message={error} />}
          </CardContent>

          <CardFooter className="flex flex-col space-y-5">
            <Button
              type="submit"
              className="w-full font-medium h-11 transition-all"
              disabled={loading || redirecting || code.length < 6}
            >
              {loading || redirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {redirecting ? "Redirecting..." : "Verifying..."}
                </>
              ) : (
                <>
                  Complete Registration
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="flex flex-col gap-2 text-center text-sm">
              <div>
                <button
                  type="button"
                  onClick={() =>
                    router.push(`/registration?login_challenge=${login_challenge}`)
                  }
                  className="font-medium text-primary hover:text-primary/80 transition-colors"
                  disabled={loading || redirecting}
                >
                  ← Back to registration
                </button>
              </div>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-md bg-destructive/15 p-3 text-center">
      <div className="flex items-center justify-center gap-2 text-destructive">
        <AlertCircle className="h-4 w-4" />
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

function InvalidFlowError() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            <AlertCircle className="inline-block mr-2 h-6 w-6" />
            Invalid Request
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p>Missing required parameters. The registration flow is invalid.</p>
          <Button asChild className="w-full">
            <a href="/">Go to Home</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
} 