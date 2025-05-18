"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OAuth2ConsentRequest } from "@ory/hydra-client";
import { AlertCircle, CheckCircle, Loader2, Shield } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface ConsentResponse {
  consent?: OAuth2ConsentRequest;
  redirect_to?: string; // For auto-approved trusted clients
}

/**
 * OAuth Consent page that allows users to approve or deny permission requests
 * Supports automatic redirection for trusted clients
 */
export default function ConsentPage() {
  const searchParams = useSearchParams();
  const consentChallenge = searchParams.get("consent_challenge");

  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState<OAuth2ConsentRequest | null>(null);

  // Fetch consent request details on component mount
  useEffect(() => {
    if (!consentChallenge) {
      setError(
        "Missing consent challenge parameter. Please try again or contact support."
      );
      setLoading(false);
      return;
    }

    const fetchConsentDetails = async () => {
      try {
        const res = await fetch(
          `/api/consent?consent_challenge=${encodeURIComponent(
            consentChallenge
          )}`,
          { signal: AbortSignal.timeout(10000) } // 10 second timeout
        );

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || `Server error: ${res.status}`);
        }

        const data: ConsentResponse = await res.json();

        // Check if we got a direct redirect_to (trusted client case)
        if (data.redirect_to) {
          setRedirecting(true);
          // Auto-redirect for trusted clients
          window.location.href = data.redirect_to;

          return;
        }

        // Regular flow - show consent page
        if (data.consent) {
          setConsent(data.consent);
        } else {
          throw new Error("Invalid response format from server");
        }
      } catch (e: any) {
        console.error("Consent fetch error:", e);
        setError(e.message || "Failed to load consent request");
      } finally {
        setLoading(false);
      }
    };

    fetchConsentDetails();
  }, [consentChallenge]);

  const handleSubmit = async (accept: boolean) => {
    if (!consentChallenge) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/consent/${
          accept ? "accept" : "reject"
        }?consent_challenge=${consentChallenge}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grant_scope: consent?.requested_scope,
            grant_access_token_audience:
              consent?.requested_access_token_audience,
          }),
        }
      );

      if (!res.ok) {
        const errorText = await res.text();
        console.log(errorText);
        throw new Error(
          errorText || `Request failed with status: ${res.status}`
        );
      }

      const { redirect_to } = await res.json();

      if (!redirect_to) {
        throw new Error("No redirect URL provided");
      }

      // Redirect to the provided URL
      window.location.href = redirect_to;
    } catch (e: any) {
      console.error("Consent submission error:", e);
      setError(e.message || "Failed to process your request");
      setSubmitting(false);
    }
  };

  // Still loading - show spinner
  if (loading || redirecting) {
    return (
      <div className="flex justify-center items-center h-screen bg-muted/50">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium text-foreground">
              Loading consent request...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error case
  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/50">
        <Card className="w-full max-w-md shadow-lg border-destructive/50">
          <CardHeader className="flex flex-col items-center pb-2">
            <div className="bg-destructive/10 rounded-full p-4 mb-2">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-xl text-center text-destructive">
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-center text-foreground">{error}</p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full max-w-xs"
            >
              Try Again
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // No consent data case
  if (!consent) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-muted/50">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="flex flex-col items-center">
            <div className="bg-muted rounded-full p-4 mb-2">
              <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl text-center text-foreground">
              No consent request found
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6">
            <p className="text-center text-muted-foreground">
              We couldn't find a valid consent request to display.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center pb-6">
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="w-full max-w-xs"
            >
              Refresh
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Format scope name to be more readable
  const formatScope = (scope: string) => {
    return scope
      .replace(/[_.-]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Normal consent page display
  return (
    <div className="flex justify-center items-center min-h-screen bg-muted/50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {consent.client?.logo_uri ? (
              <img
                src={consent.client.logo_uri}
                alt={`${consent.client.client_name} logo`}
                className="h-16 w-16 rounded-lg object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="bg-primary/10 rounded-full p-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl">Permission Request</CardTitle>
          <CardDescription className="mt-2">
            <span className="font-medium text-primary">
              {consent.client?.client_name || "An application"}
            </span>{" "}
            is requesting access to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-medium text-sm text-muted-foreground mb-1">USER</h3>
              <p className="text-lg font-medium">{consent.subject}</p>
            </div>

            <div>
              <h3 className="font-medium text-sm text-muted-foreground mb-2">
                PERMISSIONS REQUESTED
              </h3>
              <ul className="space-y-2">
                {consent.requested_scope?.map((scope) => (
                  <li key={scope} className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{formatScope(scope)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 pt-2 pb-6">
          <Button
            onClick={() => handleSubmit(true)}
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Allow Access
          </Button>

          <Button
            onClick={() => handleSubmit(false)}
            className="w-full"
            variant="outline"
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            Deny
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
