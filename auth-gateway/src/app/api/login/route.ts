import { hydraAdmin } from "@/common/ory/ory";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const url = new URL(request.url);
    const loginChallenge = url.searchParams.get("login_challenge");

    if (!loginChallenge) {
      return new Response("Missing login_challenge", { status: 400 });
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({
          error: "Email, password, and login_challenge are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const response = await hydraAdmin.acceptOAuth2LoginRequest({
      login_challenge: loginChallenge,
      acceptOAuth2LoginRequest: {
        subject: email,
      },
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message || "Invalid request" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
