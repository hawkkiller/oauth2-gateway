import { hydraAdmin } from "@/common/ory/ory";

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const consentChallenge = url.searchParams.get("consent_challenge");

  const {
    grant_scope,
    grant_access_token_audience,
  }: { grant_scope: string[]; grant_access_token_audience: string[] } =
    await request.json();

  if (!grant_scope) {
    return new Response("Missing grant_scope", { status: 400 });
  }

  if (!consentChallenge) {
    return new Response("Missing consent_challenge", { status: 400 });
  }

  const response = await hydraAdmin.acceptOAuth2ConsentRequest({
    consentChallenge,
    acceptOAuth2ConsentRequest: {
      grant_scope: grant_scope,
      grant_access_token_audience: grant_access_token_audience,
    },
  });

  return new Response(JSON.stringify(response.data));
}
