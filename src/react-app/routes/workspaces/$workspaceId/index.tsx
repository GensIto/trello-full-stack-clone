import { client } from "@/react-app/lib/hono";
import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { AvatarTooltip } from "@/components/AvatarTooltip";
import { CreateBoard } from "@/react-app/features/workspace/CreateBoard";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { queryClient } from "@/react-app/lib/query";
import { InviteMember } from "@/react-app/features/workspace/InviteMember";

export const Route = createFileRoute("/workspaces/$workspaceId/")({
  component: WorkspacePage,
  beforeLoad: async ({ params, context }) => {
    if (!context.accessToken) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
    const membershipsResponse = await queryClient.ensureQueryData({
      queryKey: ["memberships"],
      queryFn: async () => {
        const memberships = await client.api.workspaces[
          ":workspaceId"
        ].memberships.$get({
          param: {
            workspaceId: params.workspaceId,
          },
        });
        if (!memberships.ok) throw new Error(`Failed: ${memberships.status}`);
        return memberships.json();
      },
      staleTime: 1000 * 60 * 5,
    });
    return { memberships: membershipsResponse };
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
        <div className='w-full flex justify-between items-center'>
          <h2>Members</h2>
          <InviteMember workspaceId={workspaceId} />
        </div>
        <ul className='*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale'>
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
          <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {boards.length === 0 && (
              <li className='col-span-full'>No boards</li>
            )}
            {boards.map((board) => {
              return (
                <li
                  key={board.boardId}
                  className='col-span-1 border border-gray-200 rounded-md p-4'
                >
                  <Link
                    to={"/workspaces/$workspaceId/boards/$boardId"}
                    params={{ workspaceId, boardId: board.boardId as string }}
                  >
                    <h3>{board.name}</h3>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Suspense>
      </div>
    </div>
  );
}
