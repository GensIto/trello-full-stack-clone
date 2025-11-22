import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../../lib/betterAuth";

export const Route = createFileRoute("/my-page/")({
  component: MyPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/", replace: true });
    }
  },
});

function MyPage() {
  return (
    <div className='flex min-h-screen items-center justify-center'>
      <h1>My Page</h1>
    </div>
  );
}
