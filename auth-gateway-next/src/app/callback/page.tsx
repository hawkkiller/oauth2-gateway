"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CallbackPage() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const codeParam = searchParams.get("code");
    if (codeParam) {
      setCode(codeParam);
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Alert className="w-full">
            <AlertDescription className="text-center text-lg font-medium">
              You are authenticated
            </AlertDescription>
          </Alert>

          {code && (
            <div className="mt-4 w-full text-center">
              <p className="text-sm text-muted-foreground">
                Authorization Code:
              </p>
              <p className="mt-1 p-2 bg-muted rounded-md overflow-x-auto break-all">
                {code}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
