import { EnvelopeClosedIcon } from "@radix-ui/react-icons";
import {
  Button,
  Flex,
  Separator,
  Text,
  TextField
} from "@radix-ui/themes";
import React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { LoginCard } from "../components/loginCard";
import { useLoginFlow } from "../hooks/useLoginFlow";
import { useSendLoginCode } from "../hooks/useSendLoginCode";

export function meta() {
  return [
    { title: "Login" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function LoginPage() {
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
  const navigate = useNavigate();

  const loginFlow = useLoginFlow();
  const loginCode = useSendLoginCode();
  const [email, setEmail] = React.useState("");

  React.useEffect(() => {
    loginFlow.loadLoginFlow(flowId, loginChallenge);
  }, []);

  React.useEffect(() => {
    if (loginFlow.flow) {
      navigate(`/login?flow=${loginFlow.flow.id}`);
    }
  }, [loginFlow.flow]);

  React.useEffect(() => {
    if (loginCode.flow) {
      navigate(`/login/verify-code?flow=${loginCode.flow.id}`);
    }
  }, [loginCode.flow]);

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
