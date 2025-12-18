import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:7860", // Ensure this matches your auth server URL
});

export const { useSession, signIn, signUp, signOut } = authClient;
