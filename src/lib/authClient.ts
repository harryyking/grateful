import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { anonymousClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://172.20.10.2:8081",
  plugins: [
    expoClient({
      scheme: "grateful",
      storage: SecureStore,
      storagePrefix: "grateful",
    }),
    anonymousClient(),
  ],
});
