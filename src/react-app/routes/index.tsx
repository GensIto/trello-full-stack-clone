import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../lib/betterAuth";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
  },
});

function Index() {
  return (
    <main className='min-h-screen bg-background max-w-[864px] mx-auto p-8 space-y-8'>
      <h1 className='text-base leading-6 text-center text-emerald-200/70'>
        Hi Welcome to the home page
      </h1>
    </main>
  );
}
