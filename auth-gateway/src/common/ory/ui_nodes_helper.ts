import {
  UiNode,
  UiNodeInputAttributes,
  UiNodeTypeEnum,
} from "@ory/kratos-client";

export function findInputNodesInNodes(nodes: UiNode[]): UiNode[] {
  return nodes.filter((node) => node.type === UiNodeTypeEnum.Input);
}

export function findCsrfNodeInNodes(nodes: UiNode[]): UiNode | null {
  return (
    findInputNodesInNodes(nodes).find(
      (node) => (node.attributes as UiNodeInputAttributes).name === "csrf_token"
    ) || null
  );
}

export function findEmailNodeInNodes(nodes: UiNode[]): UiNode | null {
  return (
    findInputNodesInNodes(nodes).find((node) => {
      const name = (node.attributes as UiNodeInputAttributes).name;
      return name === "identifier" || name === "traits.email";
    }) || null
  );
}

export function findCsrfTokenInNodes(nodes: UiNode[]): string | null {
  const csrfNode = findCsrfNodeInNodes(nodes);
  return csrfNode ? (csrfNode.attributes as UiNodeInputAttributes).value : null;
}

export function findEmailInNodes(nodes: UiNode[]): string | null {
  const emailNode = findEmailNodeInNodes(nodes);
  return emailNode
    ? (emailNode.attributes as UiNodeInputAttributes).value
    : null;
}
