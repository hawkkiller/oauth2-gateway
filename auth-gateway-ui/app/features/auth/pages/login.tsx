import { Flex, Separator, Text } from "@radix-ui/themes";
import { Loader2Icon } from "lucide-react";
import React from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
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
      <LoginCard
        title="Sign in"
        description="Enter your email to sign in. We'll send you a code to verify your account."
      >
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
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      >
        Hello
      </Input>

      <Button
        onClick={() => loginCode.sendLoginCode(email, flow)}
        disabled={loginCode.isLoading}
      >
        {loginCode.isLoading && <Loader2Icon className="animate-spin" />}
        Login with Code
      </Button>

      <Flex justify="center">
        <Separator size="3" />
      </Flex>

      <Button variant="link">Sign Up</Button>
    </Flex>
  );
}
