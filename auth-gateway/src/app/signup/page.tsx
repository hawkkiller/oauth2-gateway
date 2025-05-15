"use client";

import { RegistrationFlow } from "@ory/kratos-client";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { findCsrfTokenInNodes } from "@/common/ory/ui_nodes_helper";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function SignupWithCodePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");
  const login_challenge = searchParams.get("login_challenge");

  // State management
  const [email, setEmail] = useState("");
  const [flowState, setFlowState] = useState<{
    flow: RegistrationFlow | null;
    isLoading: boolean;
    error: string | null;
  }>({
    flow: null,
    isLoading: true,
    error: null,
  });

  const [submitState, setSubmitState] = useState<{
    isSubmitting: boolean;
    isRedirecting: boolean;
    error: string | null;
  }>({
    isSubmitting: false,
    isRedirecting: false,
    error: null,
  });

  // Fetch the signup flow on mount
  useEffect(() => {
    const fetchFlow = async () => {
      try {
        // If no flow ID, create a new signup flow
        if (!flowId) {
          const res = await fetch(`/api/signup/flow`, {
            method: "POST",
            body: JSON.stringify({ login_challenge }),
          });

          if (!res.ok) {
            throw new Error("Failed to fetch signup flow");
          }

          const data = (await res.json()) as RegistrationFlow;

          setFlowState({
            flow: data,
            isLoading: false,
            error: null,
          });

          // Set the flow ID in the URL
          router.replace(
            `/signup?flow=${data.id}&login_challenge=${login_challenge}`
          );
          return;
        }

        const res = await fetch(`/api/signup/flow?id=${flowId}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch signup flow");
        }

        const data = (await res.json()) as RegistrationFlow;

        setFlowState({
          flow: data,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        setFlowState({
          flow: null,
          isLoading: false,
          error: err.message || "Error fetching signup flow",
        });
      }
    };

    fetchFlow();
  }, []);

  // Handle form submission to get signup code
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Reset errors and set loading
    setSubmitState((prev) => ({
      ...prev,
      isSubmitting: true,
      error: null,
    }));

    // Validate flow
    if (!flowState.flow) {
      setSubmitState((prev) => ({
        ...prev,
        isSubmitting: false,
        error: "Signup flow not found",
      }));
      return;
    }

    try {
      // Find CSRF token
      const csrfToken = findCsrfTokenInNodes(flowState.flow.ui.nodes);

      if (!csrfToken) {
        throw new Error("CSRF token not found");
      }

      // Request signup code
      const res = await fetch(`/api/signup/code?flow=${flowState.flow.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrf_token: csrfToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send signup code");
      }

      // Set redirecting state and navigate
      setSubmitState((prev) => ({
        ...prev,
        isSubmitting: false,
        isRedirecting: true,
        error: null,
      }));

      router.replace(
        `/signup/code?flow=${
          flowState.flow!.id
        }&login_challenge=${login_challenge}`
      );
    } catch (err: any) {
      setSubmitState({
        isSubmitting: false,
        isRedirecting: false,
        error: err.message || "Signup failed",
      });
    }
  };

  // Loading state while fetching flow
  if (flowState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-0 py-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            <p className="text-slate-600">Loading signup form...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state if flow fetch failed
  if (flowState.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Signup Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{flowState.error}</AlertDescription>
            </Alert>
            <Button className="w-full" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!login_challenge || !flowId) {
    return <div>Invalid login challenge or flow ID</div>;
  }

  // Main form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">
            Sign Up with Code
          </CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your email to receive a signup code
          </CardDescription>
        </CardHeader>

        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="pl-10 text-slate-900 bg-white border-slate-200"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={
                    submitState.isSubmitting || submitState.isRedirecting
                  }
                  aria-invalid={!!submitState.error}
                  aria-describedby={
                    submitState.error ? "email-error" : undefined
                  }
                />
              </div>
            </div>

            {submitState.error && (
              <div
                id="email-error"
                className="text-red-600 text-sm flex items-center gap-1 p-2 bg-red-50 rounded"
                role="alert"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span>{submitState.error}</span>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full font-medium h-11"
              disabled={
                submitState.isSubmitting ||
                submitState.isRedirecting ||
                !email ||
                !email.includes("@")
              }
              aria-busy={submitState.isSubmitting}
            >
              {submitState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : submitState.isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Send Code
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-2 text-slate-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="bg-white text-slate-700 border-slate-200"
                disabled
              >
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-white text-slate-700 border-slate-200"
                disabled
              >
                Apple
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-600">Already have an account?</span>{" "}
              <Link
                href={`/login?login_challenge=${login_challenge}`}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                Log in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 