import { hydraAdmin } from "@/common/ory/ory";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const consentChallenge = url.searchParams.get("consent_challenge");

  if (!consentChallenge) {
    return new Response("Missing consent_challenge", { status: 400 });
  }

  const consentRequest = await hydraAdmin.getOAuth2ConsentRequest({
    consentChallenge,
  });

  if (consentRequest.data.skip || consentRequest.data.client?.skip_consent) {
    const response = await hydraAdmin.acceptOAuth2ConsentRequest({
      consentChallenge,
      acceptOAuth2ConsentRequest: {
        grant_scope: consentRequest.data.requested_scope,
        grant_access_token_audience:
          consentRequest.data.requested_access_token_audience,
      },
    });

    return new Response(JSON.stringify(response.data));
  }

  return new Response(JSON.stringify(consentRequest.data));
}
