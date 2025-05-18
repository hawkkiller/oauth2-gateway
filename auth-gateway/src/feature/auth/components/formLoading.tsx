import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function FormLoading() {
  return (
    <Card className="w-full max-w-md shadow-lg border-0">
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading form...</p>
      </CardContent>
    </Card>
  );
}