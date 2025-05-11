"use client";
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
import {
  LoginFlow,
  UiNodeInputAttributes,
  UiNodeTypeEnum,
} from "@ory/kratos-client";
import { AlertCircle, ArrowRight, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function LoginWithCodePage() {
  const searchParams = useSearchParams();
  const login_challenge = searchParams.get("login_challenge");
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginFlow, setLoginFlow] = useState<LoginFlow | null>(null);

  if (!login_challenge) {
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

  useEffect(() => {
    const fetchFlow = async () => {
      const res = await fetch(`/api/login/flow`);
      const data = (await res.json()) as LoginFlow;

      if (data) {
        setLoginFlow(data);
        return;
      }

      setError("Login flow not found");
      setLoading(false);
    };

    fetchFlow();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!loginFlow) {
      setError("Login flow not found");
      setLoading(false);
      return;
    }

    try {
      const csrf_token = (
        loginFlow.ui.nodes.find(
          (node) =>
            node.type === UiNodeTypeEnum.Input &&
            (node.attributes as UiNodeInputAttributes).name === "csrf_token"
        )?.attributes as UiNodeInputAttributes
      ).value;

      const res = await fetch(`/api/login/code?flow=${loginFlow.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, csrf_token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to send login code");
      }

      sessionStorage.setItem("email", email);
      setRedirecting(true);
      router.push(
        `/login/code?flow=${loginFlow.id}&login_challenge=${login_challenge}`
      );
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

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

        <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
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
                  disabled={loading || redirecting}
                />
              </div>
            </div>
            {error && (
              <div className="text-red-600 text-sm flex items-center justify-center gap-1 p-2 bg-red-50 rounded">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full font-medium h-11"
              disabled={loading || redirecting || !email}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
                variant="outline"
                className="bg-white text-slate-700 border-slate-200"
                disabled
              >
                <GoogleIcon />
                Google
              </Button>
              <Button
                variant="outline"
                className="bg-white text-slate-700 border-slate-200"
                disabled
              >
                <AppleIcon />
                Apple
              </Button>
            </div>

            <div className="text-center text-sm">
              <span className="text-slate-600">Don't have an account?</span>{" "}
              <Link
                href="/register"
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
