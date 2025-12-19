import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "https://Muhammad-Dawood-Authentication.hf.space",
  fetchOptions: {
    credentials: "include",
  },
});

export const { useSession, signIn, signUp, signOut } = authClient;
