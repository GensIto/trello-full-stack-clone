import { authClient } from "@/react-app/lib/betterAuth";
import { client } from "@/react-app/lib/hono";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AvatarTooltip } from "@/components/AvatarTooltip";
import { CreateBoard } from "@/react-app/features/workspace/CreateBoard";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";

export const Route = createFileRoute("/workspaces/$workspaceId/")({
  component: WorkspacePage,
  beforeLoad: async ({ params }) => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
    const memberships = await client.api.workspaces[
      ":workspaceId"
    ].memberships.$get({
      param: {
        workspaceId: params.workspaceId,
      },
    });
    const membershipsData = await memberships.json();
    if (
      !membershipsData.some(
        (membership) => membership.user.userId === session.data?.user.id
      )
    ) {
      throw redirect({ to: "/my-page", replace: true });
    }
    return { memberships: membershipsData };
  },
});

function WorkspacePage() {
  const { workspaceId } = Route.useParams();
  const { memberships } = Route.useRouteContext();
  const queryClient = useQueryClient();

  const { data: boards } = useSuspenseQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const res = await client.api.workspaces[":workspaceId"].boards.$get({
        param: {
          workspaceId,
        },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      return res.json();
    },
  });

  const handleCreateBoardSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["boards"] });
  };

  return (
    <div className='w-full space-y-8'>
      <h1>Workspace Page</h1>
      <div className='w-full space-y-4'>
        <h2>Members</h2>
        <ul>
          {memberships.map(({ membership, user }) => {
            return (
              <li key={membership.membershipId}>
                <AvatarTooltip name={user.name} />
              </li>
            );
          })}
        </ul>
      </div>
      <div className='w-full space-y-4'>
        <div className='w-full flex justify-between items-center'>
          <h2>Boards</h2>
          <CreateBoard
            workspaceId={workspaceId}
            memberships={memberships.map(({ membership, user }) => ({
              membershipId: membership.membershipId,
              name: user.name,
            }))}
            onSuccess={handleCreateBoardSuccess}
          />
        </div>
        <Suspense fallback={<div>Loading...</div>}>
          <ul>
            {boards.length === 0 && <li>No boards</li>}
            {boards.map((board) => {
              return (
                <li key={board.boardId}>
                  <h3>{board.name}</h3>
                </li>
              );
            })}
          </ul>
        </Suspense>
      </div>
    </div>
  );
}
