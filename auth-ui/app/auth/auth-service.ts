import { env } from "../common/env";
import { HttpClient } from "../common/http-client";

const kratosClient = new HttpClient(env.gatewayUrl);

export async function createLoginFlow(challenge: string): Promise<LoginFlow> {
  const response = await kratosClient.get<LoginFlow>(
    `/login/browser?challenge=${challenge}`
  );

  return response.data;
}

export async function getLoginFlow(flowId: string): Promise<LoginFlow> {
  const response = await kratosClient.get<LoginFlow>(`/login/flows?id=${flowId}`);

  return response.data;
}
