import {
  VerifyCodeProps,
  VerifyCodeResponse,
} from "@/app/api/login/code/verify/route";
import { LoginFlow, Session } from "@ory/kratos-client";

/**
 * Creates login flow in Kratos and returns it
 */
export async function createLoginFlow(
  loginChallenge: string
): Promise<LoginFlow> {
  const res = await fetch(`/api/login/flow?login_challenge=${loginChallenge}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Failed to create login flow");
  }

  return res.json();
}

/**
 * Returns login flow from Kratos
 */
export async function getLoginFlow(flowId: string): Promise<LoginFlow> {
  const res = await fetch(`/api/login/flow?id=${flowId}`);

  if (!res.ok) {
    throw new Error("Failed to fetch login flow");
  }

  return res.json();
}

/**
 * Requests OTP code from Kratos
 */
export async function requestLoginCode(
  flowId: string,
  email: string,
  csrfToken: string
): Promise<LoginFlow> {
  const res = await fetch(`/api/login/code/request?flow=${flowId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, csrf_token: csrfToken }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to send login code");
  }

  return res.json();
}

/**
 * Verifies OTP code from Kratos
 */
export async function verifyLoginCode(
  props: VerifyCodeProps
): Promise<VerifyCodeResponse> {
  const res = await fetch(`/api/login/code/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(props),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to verify login code");
  }

  return res.json();
}

/**
 * Returns session from Kratos
 */
export async function getSession(): Promise<Session> {
  const res = await fetch(`/api/session`);

  if (!res.ok) {
    throw new Error("Failed to fetch session");
  }

  return res.json();
}

/**
 * Login with active session
 */
export async function loginWithActiveSession(loginChallenge: string) {
  const res = await fetch(`/api/login/active`, {
    method: "POST",
    body: JSON.stringify({ login_challenge: loginChallenge }),
  });

  if (!res.ok) {
    throw new Error("Failed to login with active session");
  }

  return res.json();
}