/**
 * Client-safe helper for protected Express endpoints.
 *
 * Calls stay same-origin: the browser hits a Next.js Route Handler, which
 * mints a JWT from the HttpOnly Better Auth cookie and forwards it to Express.
 * No token is exposed to JavaScript or persisted in browser storage.
 */
const AUTH_API_BASE_PATH = "/api/backend";

export const authenticatedApiUrl = (path: string) =>
  `${AUTH_API_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;

export const authenticatedFetch = (
  path: string,
  init: RequestInit = {},
) =>
  fetch(authenticatedApiUrl(path), {
    ...init,
    credentials: "include",
    cache: init.cache ?? "no-store",
  });
