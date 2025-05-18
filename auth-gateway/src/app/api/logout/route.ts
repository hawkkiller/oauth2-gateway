import { kratosPublic } from "@/common/ory/ory";
import { forwardSetCookieHeader } from "@/common/utils/forward-cookie";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const logoutFlow = await kratosPublic.createBrowserLogoutFlow({
      cookie: request.headers.get("cookie") || undefined,
    });
    const logoutToken = logoutFlow.data.logout_token;
    const logoutResponse = await kratosPublic.updateLogoutFlow({
      cookie: request.headers.get("cookie") || undefined,
      token: logoutToken,
    });

    const response = NextResponse.json({ message: "Signed out" });

    forwardSetCookieHeader(logoutResponse.headers["set-cookie"], response);
    return response;
  } catch (error: any) {
    console.log(error?.response?.data);
    console.error(error);
    return NextResponse.json(
      { message: "Failed to sign out", ...error?.response?.data },
      { status: 500 }
    );
  }
}
