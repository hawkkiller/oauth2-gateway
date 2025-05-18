import { kratosPublic } from "@/common/ory/ory";
import { forwardSetCookieHeader } from "@/common/utils/forward-cookie";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const flow = url.searchParams.get("flow");
  try {
    const { code, csrf_token, email } = await request.json();

    if (!flow || !code || !csrf_token || !email) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const kratosResponse = await kratosPublic.updateRegistrationFlow({
      flow,
      cookie: request.headers.get("cookie") || undefined,
      updateRegistrationFlowBody: {
        traits: { email },
        method: "code",
        code,
        csrf_token,
      },
    });

    const response = NextResponse.json(kratosResponse.data);
    forwardSetCookieHeader(kratosResponse.headers["set-cookie"], response);

    return response;
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
