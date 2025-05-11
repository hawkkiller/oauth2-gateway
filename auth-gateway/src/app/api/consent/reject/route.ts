import { hydraAdmin } from "@/common/ory/ory";

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const consentChallenge = url.searchParams.get("consent_challenge");

  if (!consentChallenge) {
    return new Response("Missing consent_challenge", { status: 400 });
  }

  const { error }: { error?: string } = await request.json();

  const response = await hydraAdmin.rejectOAuth2ConsentRequest({
    consentChallenge,
    rejectOAuth2Request: {
      error: error || "access_denied",
      error_description: "The resource owner denied the request"
    },
  });

  return new Response(JSON.stringify(response.data));
}
