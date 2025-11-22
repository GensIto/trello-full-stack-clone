import { AuthView } from "@daveyplate/better-auth-ui";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../../lib/betterAuth";

export const Route = createFileRoute("/auth/sign-up")({
  component: Signup,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/", replace: true });
    }
  },
});

function Signup() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <AuthView pathname='sign-up' />
    </div>
  );
}
