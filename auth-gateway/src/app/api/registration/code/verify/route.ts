import { hydraAdmin, kratosPublic } from "@/common/ory/ory";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const flow = url.searchParams.get("flow");
  try {
    const { code, csrf_token, login_challenge: loginChallenge, email } = await request.json();

    if (!flow || !code || !csrf_token || !loginChallenge) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const verifyRes = await kratosPublic.updateRegistrationFlow({
      flow,
      cookie: request.headers.get("cookie") || undefined,
      updateRegistrationFlowBody: {
        traits: { email },
        method: "code",
        code,
        csrf_token,
      },
    });

    const sessionData = verifyRes.data.session;

    // Accept the login challenge with Hydra using the session token
    const acceptRes = await hydraAdmin.acceptOAuth2LoginRequest({
      loginChallenge,
      acceptOAuth2LoginRequest: {
        subject: sessionData.identity.id,
      },
    });

    return NextResponse.json({
      message: "Registration successful",
      redirect_to: acceptRes.data.redirect_to,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 