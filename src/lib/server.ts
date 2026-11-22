import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export class UnauthorizedError extends Error {
  constructor() {
    super("You must be signed in.");
    this.name = "UnauthorizedError";
  }
}

/**
 * Mints a short-lived Better Auth JWT from the current HttpOnly session cookie.
 * The browser never stores the token; only server-side code can request it.
 */
export const getJwt = async () => {
  try {
    const { token } = await auth.api.getToken({
      headers: await headers(),
    });

    if (!token) {
      throw new Error("Missing JWT");
    }

    return token;
  } catch {
    throw new UnauthorizedError();
  }
};

/**
 * Server-side fetch helper that attaches a signed JWT for the Express API.
 * Use this only in Route Handlers, Server Components, or other request-scoped
 * server code (it relies on next/headers).
 */
export const authFetch = async (api: string, init: RequestInit = {}) => {
  const token = await getJwt();
  const requestHeaders = new Headers(init.headers);
  requestHeaders.set("authorization", `Bearer ${token}`);

  return fetch(api, {
    ...init,
    headers: requestHeaders,
    cache: init.cache ?? "no-store",
  });
};
