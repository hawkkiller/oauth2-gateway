import { env } from "@shared/env";
import { HttpClient } from "@shared/http-client";

const kratosClient = new HttpClient(env.gatewayUrl);

export async function createLoginFlow(challenge: string): Promise<LoginFlow> {
  const response = await kratosClient.get<LoginFlow>(
    `/login/browser?challenge=${challenge}`
  );

  return response.data;
}

export async function getLoginFlow(flowId: string): Promise<LoginFlow> {
  const response = await kratosClient.get<LoginFlow>(`/login/flows?id=${flowId}`);

  if (!response.ok) {
    throw new Error(response.error?.message);
  }

  return response.data;
}
