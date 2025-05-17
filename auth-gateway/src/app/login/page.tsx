"use client";

import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import AppleIcon from "@/components/icons/apple-icon";
import GoogleIcon from "@/components/icons/google-icon";
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
import { useLoginSubmitEmailForm } from "@/feature/auth/hooks/useLoginSubmitEmailForm";
import { useLoginFlow } from "@/feature/auth/hooks/useLoginFlow";
import { FlowError } from "@/feature/auth/components/flowError";
import { useSession } from "@/feature/auth/hooks/useSession";
import { useLoginWithActiveSession } from "@/feature/auth/hooks/useLoginWithActiveSession";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");
  const loginChallenge = searchParams.get("login_challenge");

  const flowState = useLoginFlow(flowId, loginChallenge);
  const { submitState, submitEmail } = useLoginSubmitEmailForm();
  const [email, setEmail] = useState("");

  const isProcessing = submitState.isSubmitting || submitState.isRedirecting;
  const isEmailValid = email && email.includes("@");

  useEffect(() => {
    const flowId = flowState.flow?.id;

    if (flowId && loginChallenge) {
      router.replace(`/login?flow=${flowId}`);
    }
  }, [flowState.flow]);

  // Handle form submission
  const onEmailFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!flowState.flow) {
      return;
    }

    await submitEmail(email, flowState.flow);
  };

  // Loading state while fetching flow
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

  // Error state if flow fetch failed
  if (flowState.error) {
    return <FlowError error={flowState.error} />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">
            Login with Code
          </CardTitle>
          <CardDescription className="text-center">
            Enter your email to receive a login code
          </CardDescription>
        </CardHeader>
        
        {flowState.flow?.oauth2_login_request?.challenge && (
          <SignInWithActiveSession loginChallenge={flowState.flow.oauth2_login_request.challenge} />
        )}

        <form className="space-y-4" onSubmit={onEmailFormSubmit} noValidate>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  placeholder="you@example.com"
                  className="pl-10 text-foreground bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isProcessing}
                  aria-invalid={!!submitState.error}
                  aria-describedby={
                    submitState.error ? "email-error" : undefined
                  }
                />
              </div>
            </div>

            {submitState.error && (
              <Alert variant="destructive" id="email-error" role="alert">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <AlertDescription>{submitState.error}</AlertDescription>
              </Alert>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full font-medium h-11"
              aria-busy={isProcessing}
              disabled={isProcessing || !isEmailValid}
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
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                className="bg-background text-foreground"
                disabled
              >
                <GoogleIcon />
                <span className="ml-2">Google</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-background text-foreground"
                disabled
              >
                <AppleIcon />
                <span className="ml-2">Apple</span>
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                Don't have an account?
              </span>{" "}
              <Link
                href={`/signup`}
                className="font-medium text-primary hover:text-primary/90"
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

/**
 * Component that renders "You are already logged in as {email}"
 * and a button to "Sign In using active session"
 */
function SignInWithActiveSession({ loginChallenge }: { loginChallenge: string }) {
  const sessionState = useSession();
  const { state, loginWithActiveSession } = useLoginWithActiveSession(loginChallenge);

  if (!sessionState.session?.identity?.traits?.email) return null;

  return (
    <div className="px-4 pb-4">
      <div className="w-full rounded-md bg-muted p-3 border">
        <div className="text-sm text-foreground mb-2">
          <p>You are already logged in as:</p>
          <p className="font-medium truncate">
            {sessionState.session.identity.traits.email}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full bg-background hover:bg-muted text-foreground"
          onClick={loginWithActiveSession}
          disabled={state.isLoading}
        >
          {state.isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign in using active session"
          )}
        </Button>
      </div>
    </div>
  );
}
