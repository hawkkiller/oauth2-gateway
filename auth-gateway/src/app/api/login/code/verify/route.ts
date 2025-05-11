import { kratosPublic } from "@/common/ory/ory";
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

    await kratosPublic.updateLoginFlow({
      flow,
      cookie: request.headers.get("cookie") || undefined,
      updateLoginFlowBody: {
        identifier: email,
        method: "code",
        code,
        csrf_token,
      },
    });

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  } catch (error: any) {
    const redirect_browser_to = error?.response?.data?.redirect_browser_to;
    if (redirect_browser_to) {
      return NextResponse.json({ redirect_browser_to });
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
