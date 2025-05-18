import { kratosPublic } from "@/common/ory/ory";
import { RegistrationFlow } from "@ory/kratos-client";
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

    // Initiate the code-based registration
    const response = await kratosPublic.updateRegistrationFlow({
      flow,
      cookie: request.headers.get("cookie") || undefined,
      updateRegistrationFlowBody: {
        traits: { email },
        method: "code",
        csrf_token,
      },
    });

    console.log("response", JSON.stringify(response.data, null, 2));

    return NextResponse.json(response.data, {
      status: 400,
    });
  } catch (error: any) {
    console.log("error", JSON.stringify(error.response.data, null, 2));
    if (error.response?.data && "id" in error.response.data) {
      const registrationFlow = error.response.data as RegistrationFlow;
      if (
        registrationFlow.id === flow &&
        registrationFlow.state === "sent_email"
      ) {
        return NextResponse.json({ success: true });
      }
    }
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
