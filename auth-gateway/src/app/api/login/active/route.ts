import { NextRequest, NextResponse } from "next/server";
import { kratosPublic, hydraAdmin } from "@/common/ory/ory";
import { forwardSetCookieHeader } from "@/common/utils/forward-cookie";

export type LoginWithActiveSessionProps = {
  login_challenge: string;
};

export type LoginWithActiveSessionResponse = {
  redirect_to: string;
};

/**
 * POST handler for accepting login with active session
 * @param req - The incoming request object
 * @returns A JSON response with redirect URL or error
 */
export async function POST(req: NextRequest) {
  try {
    const cookie = req.headers.get("cookie") || undefined;
    const props: LoginWithActiveSessionProps = await req.json();

    if (!props.login_challenge) {
      return NextResponse.json(
        { error: "No login challenge provided" },
        { status: 400 }
      );
    }

    // Get the active session
    const sessionResponse = await kratosPublic.toSession({
      cookie,
    });

    if (!sessionResponse.data.active) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    // Make sure identity exists before accessing it
    if (!sessionResponse.data.identity) {
      return NextResponse.json(
        { error: "Identity not found in session" },
        { status: 401 }
      );
    }

    // Accept the login challenge with the active session using hydraAdmin
    const acceptResponse = await hydraAdmin.acceptOAuth2LoginRequest({
      loginChallenge: props.login_challenge,
      acceptOAuth2LoginRequest: {
        subject: sessionResponse.data.identity.id,
        remember: true,
        remember_for: 3600,
      },
    });

    // Create response with redirect URL
    const response = NextResponse.json<LoginWithActiveSessionResponse>({
      redirect_to: acceptResponse.data.redirect_to,
    });

    // Forward any cookies from Kratos
    forwardSetCookieHeader(sessionResponse.headers["set-cookie"], response);

    return response;
  } catch (error: any) {
    console.error("Error in login with active session:", error);
    return NextResponse.json(
      { error: "Failed to process login with active session" },
      { status: 500 }
    );
  }
}
