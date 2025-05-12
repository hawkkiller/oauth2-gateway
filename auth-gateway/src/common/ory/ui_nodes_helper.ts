import {
  UiNode,
  UiNodeInputAttributes,
  UiNodeTypeEnum,
} from "@ory/kratos-client";

export function findInputNodesInNodes(nodes: UiNode[]) {
  return nodes.filter((node) => node.type === UiNodeTypeEnum.Input);
}

export function findCsrfNodeInNodes(nodes: UiNode[]) {
  return findInputNodesInNodes(nodes).find(
    (node) => (node.attributes as UiNodeInputAttributes).name === "csrf_token"
  );
}

export function findEmailNodeInNodes(nodes: UiNode[]) {
  return findInputNodesInNodes(nodes).find(
    (node) => (node.attributes as UiNodeInputAttributes).name === "identifier"
  );
}

export function findCsrfTokenInNodes(nodes: UiNode[]) {
  const csrfNode = findCsrfNodeInNodes(nodes);
  return csrfNode ? (csrfNode.attributes as UiNodeInputAttributes).value : null;
}

export function findEmailInNodes(nodes: UiNode[]) {
  const emailNode = findEmailNodeInNodes(nodes);
  return emailNode
    ? (emailNode.attributes as UiNodeInputAttributes).value
    : null;
}
