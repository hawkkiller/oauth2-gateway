import { kratosPublic } from "@/common/ory/ory";
import { forwardSetCookieHeader } from "@/common/utils/forward-cookie";
import { NextRequest, NextResponse } from "next/server";

export type VerifyCodeProps = {
  flowId: string;
  code: string;
  csrfToken: string;
  email: string;
};

export type VerifyCodeResponse = {
  redirect_browser_to: string;
};

export async function POST(request: NextRequest) {
  try {
    const req: VerifyCodeProps = await request.json();

    if (!req.flowId || !req.code || !req.csrfToken || !req.email) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const res = await kratosPublic.updateLoginFlow({
      flow: req.flowId,
      cookie: request.headers.get("cookie") || undefined,
      updateLoginFlowBody: {
        identifier: req.email,
        method: "code",
        code: req.code,
        csrf_token: req.csrfToken,
      },
    });

    console.log(res.data);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  } catch (error: any) {
    console.log(error.response.data);

    const redirect_browser_to = error?.response?.data?.redirect_browser_to;
    if (redirect_browser_to) {
      const res = NextResponse.json<VerifyCodeResponse>({
        redirect_browser_to,
      });
      forwardSetCookieHeader(error.response.headers["set-cookie"], res);
      return res;
    }

    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
