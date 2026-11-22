import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const getJwt = async () => {
  const { token } = await auth.api.getToken({
    headers: await headers(),
  });

  if (!token) throw new Error("Unauthorized");
  return token;
};

export const authFetch = async (api: string, init: RequestInit = {}) => {
  const token = await getJwt();

  return fetch(api, {
    ...init,
    headers: {
      ...init.headers,
      authorization: `Bearer ${token}`,
    },
  });
};
