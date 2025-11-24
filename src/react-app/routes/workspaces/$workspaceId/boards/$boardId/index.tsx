import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/workspaces/$workspaceId/boards/$boardId/"
)({
  component: BoardPage,
  beforeLoad: async ({ context }) => {
    if (!context.accessToken) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
  },
});

function BoardPage() {
  return (
    <div className='w-full space-y-8'>
      <h1>Board Page</h1>
    </div>
  );
}
