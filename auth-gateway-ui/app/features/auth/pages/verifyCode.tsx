import React from "react";
import { useSearchParams } from "react-router";
import { useLoginFlow } from "../hooks/useLoginFlow";
import { Button, Flex, Text, TextField } from "@radix-ui/themes";
import { LoginCard } from "../components/loginCard";
import { EnvelopeOpenIcon } from "@radix-ui/react-icons";

export function meta() {
  return [
    { title: "Verify Code" },
    { name: "description", content: "Verify your code" },
  ];
}

export default function VerifyCodePage() {
  return (
    <Flex justify="center" align="center" height="100%" width="100%">
      <LoginCard>
        <VerifyCodeForm />
      </LoginCard>
    </Flex>
  );
}

export function VerifyCodeForm() {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get("flow");
  const loginFlow = useLoginFlow();
  const [code, setCode] = React.useState("");

  React.useEffect(() => {
    loginFlow.loadLoginFlow(flowId, null);
  }, []);

  if (loginFlow.isLoading) {
    return <Text>Loading...</Text>;
  }

  if (loginFlow.error) {
    return <Text>{loginFlow.error}</Text>;
  }

  const flow = loginFlow.flow;

  if (!flow) {
    return <Text>No flow</Text>;
  }

  return (
    <Flex direction="column" gap="4">
      <Text weight="bold" size="4" align="center">
        Verify Code
      </Text>

      <Flex direction="column" gap="1">
        <TextField.Root
          placeholder="Enter code"
          size="3"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        >
          <TextField.Slot>
            <EnvelopeOpenIcon />
          </TextField.Slot>
        </TextField.Root>

        <Text color="gray" size="2" align="left">
          We sent a code to {flow.identifier}
        </Text>
      </Flex>

      <Button>Verify</Button>
    </Flex>
  );
}
