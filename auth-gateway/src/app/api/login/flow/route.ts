import { kratosPublic } from "@/common/ory/ory";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie");
  const url = new URL(req.url);
  const flowId = url.searchParams.get("id");

  try {
    // If an ID is provided, get an existing flow instead of creating a new one
    if (flowId) {
      const flow = await kratosPublic.getLoginFlow({
        id: flowId,
        cookie: cookie || undefined,
      });

      // Create a response with the flow data
      const response = NextResponse.json(flow.data);

      // Forward the Set-Cookie header from Kratos
      if (flow.headers["set-cookie"]) {
        const setCookie = flow.headers["set-cookie"];
        if (Array.isArray(setCookie)) {
          setCookie.forEach(cookie => response.headers.append("Set-Cookie", cookie));
        } else {
          response.headers.set("Set-Cookie", setCookie);
        }
      }

      return response;
    }

    // Otherwise create a new flow
    const flow = await kratosPublic.createBrowserLoginFlow({
      // Forward the cookies from the user's request
      cookie: cookie || undefined,
      // You can add return_to if needed
      // returnTo: "https://your-app.com/after-login",
    });

    // Create a response with the flow data
    const response = NextResponse.json(flow.data);

    // Forward the Set-Cookie header from Kratos
    if (flow.headers["set-cookie"]) {
      const setCookie = flow.headers["set-cookie"];
      if (Array.isArray(setCookie)) {
        setCookie.forEach(cookie => response.headers.append("Set-Cookie", cookie));
      } else {
        response.headers.set("Set-Cookie", setCookie);
      }
    }

    return response;
  } catch (error) {
    console.error("Error with login flow:", error);
    return NextResponse.json(
      { error: "Failed to process login flow" },
      { status: 500 }
    );
  }
}
