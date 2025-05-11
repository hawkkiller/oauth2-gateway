import { kratosPublic } from "@/common/ory/ory";
import { LoginFlow } from "@ory/kratos-client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const flow = url.searchParams.get("flow");
  try {
    const { email, csrf_token } = await request.json();

    if (!email || !csrf_token || !flow) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Initiate the code-based login
    const response = await kratosPublic.updateLoginFlow({
      flow,
      cookie: request.headers.get("cookie") || undefined,
      updateLoginFlowBody: {
        identifier: email,
        method: "code",
        csrf_token,
      },
    });

    return NextResponse.json(response.data, {
      status: 400,
    });
  } catch (error: any) {
    if (error.response?.data && "id" in error.response.data) {
      const loginFlow = error.response.data as LoginFlow;

      if (loginFlow.id === flow && loginFlow.state === "sent_email") {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
