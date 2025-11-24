import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client } from "@/react-app/lib/hono";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export function AddBoardMember({
  workspaceId,
  boardId,
  existingMemberIds,
}: {
  workspaceId: string;
  boardId: string;
  existingMemberIds: string[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMembershipId, setSelectedMembershipId] = useState<string>("");

  const { data: workspaceMemberships } = useSuspenseQuery({
    queryKey: ["workspace-memberships", workspaceId],
    queryFn: async () => {
      const res = await client.api.workspaces[":workspaceId"].memberships.$get({
        param: { workspaceId },
      });
      if (!res.ok) throw new Error("Failed to fetch workspace memberships");
      return res.json();
    },
  });

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: async (membershipId: string) => {
      const res = await client.api.workspaces[":workspaceId"].boards[
        ":boardId"
      ].memberships.$post({
        param: { workspaceId, boardId },
        json: { membershipId },
      });
      if (!res.ok) throw new Error("Failed to add member");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["board", workspaceId, boardId],
      });
      setIsOpen(false);
      toast.success("Member added to board");
      setSelectedMembershipId("");
    },
    onError: (error) => {
      console.error("Error adding member to board:", error);
      toast.error("An error occurred while adding the member");
    },
  });

  const candidates = workspaceMemberships.filter(
    (wm) => !existingMemberIds.includes(wm.user.userId)
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>Add member</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add member to board</DialogTitle>
          <DialogDescription>
            Select a workspace member to add to this board.
          </DialogDescription>
        </DialogHeader>
        <div className='py-4'>
          <Select
            value={selectedMembershipId}
            onValueChange={setSelectedMembershipId}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select a member' />
            </SelectTrigger>
            <SelectContent>
              {candidates.map((wm) => (
                <SelectItem
                  key={wm.membership.membershipId}
                  value={wm.membership.membershipId}
                >
                  {wm.user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            onClick={() => mutate(selectedMembershipId)}
            disabled={!selectedMembershipId || isPending}
          >
            {isPending ? "Adding..." : "Add"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
