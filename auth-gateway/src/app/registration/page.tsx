"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  RegistrationFlow,
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

export default function RegistrationWithCodePage() {
  // Router and params
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginChallenge = searchParams.get("login_challenge");

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


  // Fetch the registration flow on mount
  useEffect(() => {
    if (!loginChallenge) return;

    const fetchFlow = async () => {
      try {
        const res = await fetch("/api/registration/flow");

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to fetch registration flow");
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
          error: err.message || "Error fetching registration flow",
        });
      }
    };

    fetchFlow();
  }, [loginChallenge]);

  // Handle form submission to get registration code
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
        error: "Registration flow not found",
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

      // Request registration code
      const res = await fetch(`/api/registration/code?flow=${flowState.flow.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrf_token: csrfToken }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to send registration code");
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

      router.replace(
        `/registration/code?flow=${
          flowState.flow!.id
        }&login_challenge=${loginChallenge}`
      );
    } catch (err: any) {
      console.log("Error", err);
      setSubmitState({
        isSubmitting: false,
        isRedirecting: false,
        error: err.message || "Registration failed",
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
                Please start the registration process from your application.
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
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // Show error if flow fetching failed
  if (flowState.error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              <AlertCircle className="inline-block mr-2 h-6 w-6" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{flowState.error}</AlertDescription>
            </Alert>
            <Button
              className="w-full"
              onClick={() => router.refresh()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">
            Create an Account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a verification code
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  className="pl-10 h-12"
                  id="email"
                  placeholder="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={submitState.isSubmitting || submitState.isRedirecting}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {submitState.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitState.error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={
                submitState.isSubmitting ||
                submitState.isRedirecting ||
                !email
              }
            >
              {submitState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending code...
                </>
              ) : submitState.isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Continue with Email
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="relative flex items-center">
              <div className="flex-1 border-t border-gray-200"></div>
              <div className="px-4 text-sm text-gray-500">or</div>
              <div className="flex-1 border-t border-gray-200"></div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-11">
                <GoogleIcon className="mr-2 h-5 w-5" />
                Google
              </Button>
              <Button variant="outline" className="h-11">
                <AppleIcon className="mr-2 h-5 w-5" />
                Apple
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center text-sm">
            <div className="text-gray-600">
              Already have an account?{" "}
              <Link
                href={`/login?login_challenge=${loginChallenge}`}
                className="font-medium text-primary hover:text-primary/80 transition-colors"
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