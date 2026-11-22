import { betterAuth } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
export const db = client.db("gearnestdb");

export const auth = betterAuth({
  plugins: [jwt()],
  emailAndPassword: {
    enabled: true,
  },
  database: mongodbAdapter(db, {
    client,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: ["customer", "admin", "owner"],
        required: false,
        defaultValue: "customer",
        // The signup form can choose customer or owner. The before hook below
        // prevents a client from assigning the admin role to itself.
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
      address: {
        type: "string",
        required: false,
        defaultValue: "",
        input: true,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== "/sign-up/email") {
        return;
      }

      const body = ctx.body as { role?: unknown } | undefined;
      const role = body?.role === "owner" ? "owner" : "customer";

      return {
        context: {
          ...ctx,
          body: {
            ...body,
            role,
          },
        },
      };
    }),
  },
});
