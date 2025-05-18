import { kratosPublic } from "@/common/ory/ory";
import { NextRequest, NextResponse } from "next/server";

/**
 * Returns session from Kratos
 */
export async function GET(request: NextRequest) {
  try {
    const session = await kratosPublic.toSession({
      cookie: request.headers.get("cookie") || undefined,
    });

    return NextResponse.json(session.data);
  } catch (error: any) {
    console.error(error?.response?.data);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
