import { AvatarTooltip } from "@/components/AvatarTooltip";
import { client } from "@/react-app/lib/hono";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { AddBoardMember } from "@/react-app/features/board/AddBoardMember";
import { CreateCard } from "@/react-app/features/card/CreateCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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

  const { data: cards } = useSuspenseQuery({
    queryKey: ["cards", workspaceId, boardId],
    queryFn: async () => {
      const res = await client.api.workspaces[":workspaceId"].boards[
        ":boardId"
      ].cards.$get({
        param: {
          workspaceId,
          boardId,
        },
      });
      if (!res.ok) throw new Error(`Failed to fetch cards: ${res.status}`);
      return res.json();
    },
  });

  const columns = [
    { id: "todo", title: "Todo" },
    { id: "in_progress", title: "In Progress" },
    { id: "done", title: "Done" },
  ];

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
        <div className='flex gap-2'>
          <CreateCard
            workspaceId={workspaceId}
            boardId={boardId}
            members={board.members}
          />
          <AddBoardMember
            workspaceId={workspaceId}
            boardId={boardId}
            existingMemberIds={board.members.map((m) => m.userId)}
          />
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {columns.map((col) => (
          <div key={col.id} className='space-y-4'>
            <h3 className='font-bold capitalize'>{col.title}</h3>
            <div className='space-y-3'>
              {cards
                .filter((c) => c.status === col.id)
                .map((card) => (
                  <Card key={card.id}>
                    <CardHeader className='p-4 pb-2'>
                      <CardTitle className='text-base'>{card.title}</CardTitle>
                      <CardDescription>{card.description}</CardDescription>
                    </CardHeader>
                    <CardContent className='p-4 pt-0'>
                      <div className='flex justify-between items-center mt-2'>
                        <div className='text-xs text-muted-foreground'>
                          {new Date(card.dueDate).toLocaleDateString()}
                        </div>
                        {card.assignee && (
                          <AvatarTooltip name={card.assignee.name} />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
