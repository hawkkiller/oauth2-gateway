"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { ActiveSessionForm } from "@/feature/auth/components/activeSessionForm";
import { FlowError } from "@/feature/auth/components/flowError";
import { LoginForm } from "@/feature/auth/components/loginForm";
import { useLoginWithActiveSession } from "@/feature/auth/hooks/useLoginWithActiveSession";
import { useSession } from "@/feature/auth/hooks/useSession";
import { signOut } from "@/feature/auth/service/auth";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const flowId = searchParams.get("flow");
  const loginChallenge = searchParams.get("login_challenge");

  const sessionState = useSession();
  const [showLoginUI, setShowLoginUI] = useState(false);

  const activeSession = useLoginWithActiveSession();

  useEffect(() => {
    if (!loginChallenge) {
      return;
    }

    const fromRegistration = searchParams.get("from_registration");
    if (sessionState.session?.active && fromRegistration) {
      activeSession.loginWithActiveSession(loginChallenge);
    }
  }, [sessionState.session]);

  const handleCancelActiveSession = async () => {
    try {
      await signOut();
      setShowLoginUI(true);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  if (!flowId && !loginChallenge) {
    return <FlowError error="No flow or login challenge provided" />;
  }

  const emailTrait = sessionState.session?.identity?.traits?.email;
  const showActiveSession = emailTrait && !showLoginUI && loginChallenge;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        {showActiveSession ? (
          <ActiveSessionForm
            email={emailTrait}
            onCancel={handleCancelActiveSession}
            isLoading={activeSession.state.isLoading}
            onLogin={() => {
              activeSession.loginWithActiveSession(loginChallenge);
            }}
          />
        ) : (
          <LoginForm flowId={flowId} loginChallenge={loginChallenge} />
        )}
      </Card>
    </div>
  );
}
