"use client";
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
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function OTPSubmitPage() {
  const searchParams = useSearchParams();
  const flow = searchParams.get("flow");
  const email = sessionStorage.getItem("email");
  const login_challenge = searchParams.get("login_challenge");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loginFlow, setLoginFlow] = useState<LoginFlow | null>(null);

  if (!flow || !login_challenge || !email) {
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
      try {
        const res = await fetch(`/api/login/flow?id=${flow}`);
        if (!res.ok) {
          throw new Error("Failed to fetch login flow");
        }
        const data = (await res.json()) as LoginFlow;
        setLoginFlow(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch login flow");
      }
    };

    fetchFlow();
  }, [flow]);

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

      const res = await fetch(`/api/login/code/verify?flow=${flow}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          code,
          csrf_token,
          login_challenge,
          email,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to verify code");
      }

      const data = await res.json();
      // Redirect to the location provided by the API or to a default page
      router.push(data.redirect_to || "/");
    } catch (err: any) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center font-bold">
            Enter Verification Code
          </CardTitle>
          <CardDescription className="text-center text-slate-500">
            Enter the code sent to your email
          </CardDescription>
        </CardHeader>

        <form className="space-y-4" autoComplete="off" onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-700"
              >
                Code
              </label>
              <div className="flex justify-center py-2">
                <InputOTP
                  maxLength={6}
                  value={code}
                  onChange={setCode}
                  disabled={loading}
                  containerClassName="justify-center"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <InputOTPSlot key={i} index={i} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
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
              disabled={loading || code.length < 6}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <>
                  Submit
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="text-center text-sm text-slate-500">
              Didn't receive a code?{" "}
              <button
                type="button"
                onClick={() => router.push(`/login?login_challenge=${login_challenge}`)}
                className="font-medium text-indigo-600 hover:text-indigo-800"
              >
                Go back
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
