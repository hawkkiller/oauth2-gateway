import { AlertDescription } from "@/components/ui/alert";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export function FlowError({ error }: { error: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Login Error</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <Button className="w-full" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
