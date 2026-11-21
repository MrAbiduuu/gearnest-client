import { auth } from "@/lib/auth";
import {
  ensureDemoAccount,
  getDemoAccount,
  isDemoRole,
} from "@/lib/demo-accounts.server";

export async function POST(request: Request) {
  let requestedRole: unknown;

  try {
    ({ role: requestedRole } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  if (!isDemoRole(requestedRole)) {
    return Response.json({ error: "Unknown demo account." }, { status: 400 });
  }

  const account = getDemoAccount(requestedRole);

  try {
    await ensureDemoAccount(requestedRole);

    const authResponse = await auth.api.signInEmail({
      body: {
        email: account.email,
        password: account.password,
      },
      asResponse: true,
      headers: request.headers,
    });

    if (!authResponse.ok) {
      return Response.json(
        { error: "Could not sign in to the demo account." },
        { status: 401 },
      );
    }

    const response = Response.json({ redirect: account.redirect });
    for (const cookie of authResponse.headers.getSetCookie()) {
      response.headers.append("set-cookie", cookie);
    }

    return response;
  } catch (error) {
    console.error("Demo sign-in failed", error);
    return Response.json(
      { error: "Could not sign in to the demo account." },
      { status: 500 },
    );
  }
}
