"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  LoginFlow,
  UiNodeInputAttributes,
  UiNodeTypeEnum,
} from "@ory/kratos-client";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";

import AppleIcon from "@/components/icons/apple-icon";
import GoogleIcon from "@/components/icons/google-icon";
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
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginWithCodePage() {
  // Router and params
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginChallenge = searchParams.get("login_challenge");

  // State management
  const [email, setEmail] = useState("");
  const [flowState, setFlowState] = useState<{
    flow: LoginFlow | null;
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


  // Fetch the login flow on mount
  useEffect(() => {
    if (!loginChallenge) return;

    const fetchFlow = async () => {
      try {
        const res = await fetch("/api/login/flow");

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch login flow");
        }

        const data = (await res.json()) as LoginFlow;

        setFlowState({
          flow: data,
          isLoading: false,
          error: null,
        });
      } catch (err: any) {
        setFlowState({
          flow: null,
          isLoading: false,
          error: err.message || "Error fetching login flow",
        });
      }
    };

    fetchFlow();
  }, [loginChallenge]);

  // Handle form submission to get login code
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
        error: "Login flow not found",
      }));
      return;
    }

    try {
      // Find CSRF token
      const csrfNode = flowState.flow.ui.nodes.find(
        (node) =>
          node.type === UiNodeTypeEnum.Input &&
          (node.attributes as UiNodeInputAttributes).name === "csrf_token"
      );

      if (!csrfNode) {
        throw new Error("CSRF token not found");
      }

      const csrfToken = (csrfNode.attributes as UiNodeInputAttributes).value;

      // Request login code
      const res = await fetch(`/api/login/code?flow=${flowState.flow.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrf_token: csrfToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send login code");
      }

      // Store email for the code verification page
      try {
        sessionStorage.setItem("email", email);
      } catch (storageErr) {
        console.error("Failed to store email in sessionStorage:", storageErr);
        // Continue anyway as this is not critical
      }

      // Set redirecting state and navigate
      setSubmitState((prev) => ({
        ...prev,
        isSubmitting: false,
        isRedirecting: true,
        error: null,
      }));

      console.log("Redirecting");
      router.replace(
        `/login/code?flow=${
          flowState.flow!.id
        }&login_challenge=${loginChallenge}`
      );
    } catch (err: any) {
      console.log("Error", err);
      setSubmitState({
        isSubmitting: false,
        isRedirecting: false,
        error: err.message || "Authentication failed",
      });
    }
  };

  // Show error if no login challenge is provided
  if (!loginChallenge) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="border-b px-4 py-2">
            <CardTitle className="text-2xl text-center w-full flex items-center justify-center gap-2">
              <AlertCircle className="w-6 h-6" />
              Missing Login Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 px-6">
            <div className="text-center text-gray-700 space-y-4 flex flex-col items-center">
              <div
                className="text-5xl mb-4 flex justify-center"
                aria-hidden="true"
              >
                🔒
              </div>
              <p className="text-lg font-medium">
                No login challenge was provided.
              </p>
              <p className="pb-4">
                Please start the login process from your application.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state while fetching flow
  if (flowState.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-0 py-8">
          <CardContent className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
            <p className="text-slate-600">Loading login form...</p>
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
            <CardTitle className="text-2xl text-center">Login Error</CardTitle>
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

  // Main form
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">
            Login with Code
          </CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter your email to receive a login code
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
                <GoogleIcon />
                <span className="ml-2">Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-white text-slate-700 border-slate-200"
                disabled
              >
                <AppleIcon />
                <span className="ml-2">Apple</span>
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-600">Don't have an account?</span>{" "}
              <Link
                href={`/register?login_challenge=${loginChallenge}`}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                Create an account
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
