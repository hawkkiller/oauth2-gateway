"use client";

import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export type ActiveSessionFormProps = {
  email: string;
  isLoading: boolean;
  onLogin: () => void;
  onCancel: () => void;
};

export function ActiveSessionForm(props: ActiveSessionFormProps) {
  return (
    <>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center font-bold">
          Active Session Found
        </CardTitle>
        <CardDescription className="text-center">
          You're already logged in
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="w-full rounded-md bg-muted p-4 border">
          <div className="text-sm text-foreground mb-3">
            <p>You are already logged in as:</p>
            <p className="font-medium truncate mt-1">{props.email}</p>
          </div>

          <div className="space-y-2">
            <Button
              type="button"
              className="w-full font-medium"
              onClick={props.onLogin}
              disabled={props.isLoading}
            >
              {props.isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in with active session"
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-background hover:bg-muted text-foreground"
              onClick={props.onCancel}
              disabled={props.isLoading}
            >
              Use another account
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );
}
