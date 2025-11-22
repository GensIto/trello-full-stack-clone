import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../lib/betterAuth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
    throw redirect({ to: "/my-page", replace: true });
  },
});
