import React from "react";
import { useSearchParams } from "react-router";
import { useLoginFlow } from "../hooks/useLoginFlow";

export function meta() {
  return [
    { title: "Verify Code" },
    { name: "description", content: "Verify your code" },
  ];
}

export default function VerifyCode() {
  const [searchParams] = useSearchParams();
  const flowId = searchParams.get("flow");
  const loginFlow = useLoginFlow();

  React.useEffect(() => {
    loginFlow.loadLoginFlow(flowId, null);
  }, []);

  if (loginFlow.isLoading) {
    return <div>Loading...</div>;
  }

  if (loginFlow.error) {
    return <div>{loginFlow.error}</div>;
  }

  return <div>VerifyCode</div>;
}
