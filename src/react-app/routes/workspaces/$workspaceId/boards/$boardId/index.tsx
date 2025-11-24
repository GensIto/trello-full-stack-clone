import { AvatarTooltip } from "@/components/AvatarTooltip";
import { client } from "@/react-app/lib/hono";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AddBoardMember } from "@/react-app/features/board/AddBoardMember";

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
  const { workspaceId, boardId } = Route.useParams();

  const { data: board } = useSuspenseQuery({
    queryKey: ["board", workspaceId, boardId],
    queryFn: async () => {
      const res = await client.api.workspaces[":workspaceId"].boards[
        ":boardId"
      ].$get({
        param: {
          workspaceId,
          boardId,
        },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      return res.json();
    },
  });

  return (
    <div className='w-full space-y-8'>
      <h1>{board.name}</h1>
      <div className='w-full space-y-4 flex justify-between items-start'>
        <div className='space-y-2'>
          <h2>board members</h2>
          <ul className='flex flex-wrap gap-2'>
            {board.members.map((member) => (
              <li key={member.userId}>
                <AvatarTooltip name={member.name} />
              </li>
            ))}
          </ul>
        </div>
        <AddBoardMember
          workspaceId={workspaceId}
          boardId={boardId}
          existingMemberIds={board.members.map((m) => m.userId)}
        />
      </div>
    </div>
  );
}
