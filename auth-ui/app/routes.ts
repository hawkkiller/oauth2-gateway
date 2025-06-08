import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("login", "features/auth/pages/login.tsx"),
] satisfies RouteConfig;
