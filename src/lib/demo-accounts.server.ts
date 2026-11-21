import { hashPassword } from "better-auth/crypto";
import { auth, db } from "@/lib/auth";

export type DemoRole = "admin" | "owner";

type DemoAccount = {
  email: string;
  password: string;
  name: string;
  role: DemoRole;
  redirect: string;
};

// Demo-only accounts. Credentials live on the server so they are never bundled
// into the client; override them with env vars if needed.
const demoAccounts: Record<DemoRole, DemoAccount> = {
  admin: {
    email: process.env.DEMO_ADMIN_EMAIL ?? "demo.admin@example.com",
    password: process.env.DEMO_ADMIN_PASSWORD ?? "DemoAdmin123!",
    name: "Demo Admin",
    role: "admin",
    redirect: "/dashboard/admin",
  },
  owner: {
    email: process.env.DEMO_OWNER_EMAIL ?? "demo.owner@example.com",
    password: process.env.DEMO_OWNER_PASSWORD ?? "DemoOwner123!",
    name: "Demo Owner",
    role: "owner",
    redirect: "/dashboard/owner",
  },
};

export const isDemoRole = (value: unknown): value is DemoRole =>
  value === "admin" || value === "owner";

export const getDemoAccount = (role: DemoRole): DemoAccount =>
  demoAccounts[role];

/**
 * Creates the demo account on first use if it does not exist, then resets its
 * role and password so the demo buttons always work, even after profile edits.
 */
export const ensureDemoAccount = async (role: DemoRole): Promise<void> => {
  const account = demoAccounts[role];
  const users = db.collection("user");

  let user = await users.findOne({ email: account.email });

  if (!user) {
    try {
      await auth.api.signUpEmail({
        body: {
          email: account.email,
          password: account.password,
          name: account.name,
        },
      });
    } catch {
      // A concurrent demo click may have created it first.
    }

    user = await users.findOne({ email: account.email });
    if (!user) {
      throw new Error(`Unable to create the demo ${role} account.`);
    }
  }

  const passwordHash = await hashPassword(account.password);

  await users.updateOne(
    { _id: user._id },
    {
      $set: {
        role: account.role,
        updatedAt: new Date(),
      },
    },
  );

  await db.collection("account").updateOne(
    { userId: user._id, providerId: "credential" },
    {
      $set: {
        password: passwordHash,
        updatedAt: new Date(),
      },
      $setOnInsert: {
        userId: user._id,
        accountId: user._id.toString(),
        providerId: "credential",
        createdAt: new Date(),
      },
    },
    { upsert: true },
  );
};
