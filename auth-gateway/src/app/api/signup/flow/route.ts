import { kratosPublic } from "@/common/ory/ory";
import { forwardSetCookieHeader } from "@/common/utils/forward-cookie";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  const url = new URL(req.url);
  const flowId = url.searchParams.get("id");

  if (!flowId) {
    return NextResponse.json({ error: "No flow ID provided" }, { status: 400 });
  }

  try {
    const flow = await kratosPublic.getRegistrationFlow({
      id: flowId,
      cookie: cookie || undefined,
    });

    const response = NextResponse.json(flow.data);
    forwardSetCookieHeader(flow.headers["set-cookie"], response);
    return response;
  } catch (error) {
    console.error("Error with registration flow:", error);
    return NextResponse.json(
      { error: "Failed to process registration flow" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { login_challenge } = await req.json();

  if (!login_challenge) {
    return NextResponse.json(
      { error: "No login challenge provided" },
      { status: 400 }
    );
  }

  const flow = await kratosPublic.createBrowserRegistrationFlow({
    loginChallenge: login_challenge,
  });

  const response = NextResponse.json(flow.data);
  forwardSetCookieHeader(flow.headers["set-cookie"], response);

  return response;
}
