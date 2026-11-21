import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

const mongoUrl = process.env.MONGODB_URI;

if (!mongoUrl) {
  throw new Error("MONGODB_URI is required for Better Auth.");
}

const mongoClient = new MongoClient(mongoUrl);
const database = mongoClient.db();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: mongodbAdapter(database),
  // The client and the Express API are separate Vercel origins; only
  // these origins may start a Better Auth flow against this app.
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
    "https://equp-rent-client.vercel.app",
    "http://localhost:3000",
  ].filter((origin): origin is string => Boolean(origin)),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        input: false,
      },
      phoneNumber: {
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
});
