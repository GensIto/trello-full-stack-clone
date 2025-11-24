import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { client } from "@/react-app/lib/hono";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { Checkbox } from "@/components/ui/checkbox";
import { queryClient } from "@/react-app/lib/query";
import { useMutation } from "@tanstack/react-query";

export function CreateBoard({
  workspaceId,
  memberships,
  onSuccess,
}: {
  workspaceId: string;
  memberships: { membershipId: string; name: string }[];
  onSuccess: () => void;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: createBoard } = useMutation({
    mutationFn: async ({
      value,
    }: {
      value: { boardName: string; membershipIds: string[] };
    }) => {
      const res = await client.api.workspaces[":workspaceId"].boards.$post({
        param: {
          workspaceId: workspaceId,
        },
        json: {
          name: value.boardName,
          membershipIds: value.membershipIds,
        },
      });
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["boards"],
        refetchType: "active",
      });
      toast.success("Board created successfully");
      form.reset();
      setIsDialogOpen(false);
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating board:", error);
      toast.error("An error occurred while creating the board");
    },
  });

  const form = useForm({
    defaultValues: {
      boardName: "",
      membershipIds: memberships.map((m) => m.membershipId),
    },
    validators: {
      onChange: z.object({
        boardName: z.string().min(1),
        membershipIds: z
          .array(z.string())
          .min(1, "At least one member is required"),
      }),
    },
    onSubmit: createBoard,
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>create board</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            e.stopPropagation();
            await form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create board</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='grid gap-3'>
              <form.Field
                name='boardName'
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Board name is required"
                      : value.length < 1
                        ? "Board name must be at least 1 character"
                        : undefined,
                }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Board Name</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      type='text'
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {!field.state.meta.isValid && (
                      <em>{field.state.meta.errors.join(",")}</em>
                    )}
                  </>
                )}
              />
              <form.Field
                name='membershipIds'
                mode='array'
                validators={{
                  onChange: ({ value }) =>
                    !value || value.length < 1
                      ? "At least one member is required"
                      : undefined,
                }}
                children={(field) => (
                  <div className='space-y-2'>
                    <Label htmlFor={field.name}>Assign members</Label>
                    {memberships.map((membership) => (
                      <div
                        className='flex items-center gap-2'
                        key={membership.membershipId}
                      >
                        <Checkbox
                          id={membership.membershipId}
                          checked={field.state.value.includes(
                            membership.membershipId
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.handleChange([
                                ...field.state.value,
                                membership.membershipId,
                              ]);
                            } else {
                              field.handleChange(
                                field.state.value.filter(
                                  (id) => id !== membership.membershipId
                                )
                              );
                            }
                          }}
                        />
                        <Label htmlFor={membership.membershipId}>
                          {membership.name}
                        </Label>
                      </div>
                    ))}
                    {!field.state.meta.isValid && (
                      <em className='text-red-500'>
                        {field.state.meta.errors.join(", ")}
                      </em>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant='outline' type='button'>
                Cancel
              </Button>
            </DialogClose>
            <Button type='submit'>Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
