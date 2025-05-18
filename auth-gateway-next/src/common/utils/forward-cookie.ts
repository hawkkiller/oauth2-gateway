import { NextResponse } from "next/server";

/**
 * Forward the Set-Cookie header from server-side to client-side
 * @param setCookie - The Set-Cookie header value
 * @param res - The response object
 */
export function forwardSetCookieHeader(
  setCookie: string | string[] | undefined,
  res: NextResponse
) {
  if (!setCookie) return;

  if (Array.isArray(setCookie)) {
    setCookie.forEach((cookie) => res.headers.append("Set-Cookie", cookie));
  } else {
    res.headers.set("Set-Cookie", setCookie);
  }
}
