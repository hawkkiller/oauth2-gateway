import { kratosPublic } from "@/common/ory/ory";
import { forwardSetCookieHeader } from "@/common/utils/forward-cookie";
import { NextRequest, NextResponse } from "next/server";

/**
 * GET request handler for fetching login flow
 * @param req - The incoming request object
 * @param id - The flow ID, to create it use POST request
 * @returns A JSON response containing the login flow data
 */
export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  const url = new URL(req.url);
  const flowId = url.searchParams.get("id");

  if (!flowId) {
    return NextResponse.json({ error: "No flow ID provided" }, { status: 400 });
  }

  try {
    const flow = await kratosPublic.getLoginFlow({
      id: flowId,
      cookie: cookie || undefined,
    });

    // Create a response with the flow data
    const response = NextResponse.json(flow.data);
    forwardSetCookieHeader(flow.headers["set-cookie"], response);

    return response;
  } catch (error) {
    console.error("Error with login flow:", error);
    return NextResponse.json(
      { error: "Failed to process login flow" },
      { status: 500 }
    );
  }
}

/**
 * POST request handler for creating a login flow
 * @param req - The incoming request object
 * @param login_challenge - The login challenge
 * @returns A JSON response containing the login flow data
 */
export async function POST(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  const { login_challenge } = await req.json();

  const flow = await kratosPublic.createBrowserLoginFlow({
    cookie: cookie || undefined,
    loginChallenge: login_challenge,
  });

  const response = NextResponse.json(flow.data);
  forwardSetCookieHeader(flow.headers["set-cookie"], response);

  return response;
}
