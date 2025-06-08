import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Card,
  Flex,
  Separator,
  Text,
  TextField,
} from "@radix-ui/themes";
import React from "react";
import { useSearchParams } from "react-router";
import * as authService from "../service/auth-service";

export function meta() {
  return [
    { title: "Login" },
    { name: "description", content: "Login to your account" },
  ];
}

function useSendLoginCode(): {
  sendLoginCode: (email: string, flow: LoginFlow) => Promise<void>;
  isLoading: boolean;
  error: string | null;
} {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sendLoginCode = async (email: string, flow: LoginFlow) => {
    setIsLoading(true);
    setError(null);

    await authService.sendLoginCode(email, flow);

    setIsLoading(false);
    setError("Invalid email");
  };

  return { sendLoginCode, isLoading, error };
}

function useLoginFlow(): {
  loadLoginFlow: (
    flowId: string | null,
    challenge: string | null
  ) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  flow: LoginFlow | null;
} {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [flow, setLoginFlow] = React.useState<LoginFlow | null>(null);

  const loadLoginFlow = async (
    flowId: string | null,
    challenge: string | null
  ) => {
    if (!flowId && !challenge) {
      setError("Invalid flow or challenge");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (challenge) {
        const loginFlow = await authService.createLoginFlow(challenge);
        setLoginFlow(loginFlow);
      }

      if (flowId) {
        const loginFlow = await authService.getLoginFlow(flowId);
        setLoginFlow(loginFlow);
      }
    } catch (error) {
      setError("Error loading login flow: " + error);
    } finally {
      setIsLoading(false);
    }
  };

  return { loadLoginFlow, isLoading, error, flow };
}

export default function Login() {
  return (
    <Flex justify="center" align="center" height="100%" width="100%">
      <LoginCard>
        <LoginFormFlow />
      </LoginCard>
    </Flex>
  );
}

function LoginFormFlow() {
  // Parameters
  const [searchParams] = useSearchParams();
  const loginChallenge = searchParams.get("login_challenge");
  const flowId = searchParams.get("flow");

  const loginFlow = useLoginFlow();
  const loginCode = useSendLoginCode();
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    loginFlow.loadLoginFlow(flowId, loginChallenge);
  }, [loginChallenge, flowId]);

  React.useEffect(() => {
    if (loginFlow.flow) {
      window.history.replaceState({}, "", `/login?flow=${loginFlow.flow.id}`);
    }
  }, [loginFlow.flow]);

  if (loginFlow.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (loginFlow.error) {
    return <Text>{loginFlow.error}</Text>;
  }

  const flow = loginFlow.flow;

  if (!flow) {
    return <Text>No login flow</Text>;
  }

  return (
    <Flex direction="column" gap="4">
      <Text weight="bold" size="4" align="center">
        Sign in
      </Text>
      <TextField.Root
        placeholder="Email"
        size="3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      >
        <TextField.Slot>
          <EnvelopeClosedIcon />
        </TextField.Slot>
      </TextField.Root>

      <Button
        size="2"
        onClick={() => loginCode.sendLoginCode(email, flow)}
        loading={loginCode.isLoading}
      >
        Login with Code
      </Button>

      <Flex justify="center">
        <Separator size="3" />
      </Flex>

      <Button size="2" variant="soft">
        Sign Up
      </Button>
    </Flex>
  );
}

function LoginCard({ children }: { children: React.ReactNode }) {
  return (
    <Box width="100%" maxWidth="400px" asChild>
      <Card size="3">
        <Flex direction="column" gap="4">
          {children}
        </Flex>
      </Card>
    </Box>
  );
}
