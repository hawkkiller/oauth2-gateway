import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("login", "features/auth/pages/login.tsx"),
  route("login/verify-code", "features/auth/pages/verifyCode.tsx"),
] satisfies RouteConfig;
