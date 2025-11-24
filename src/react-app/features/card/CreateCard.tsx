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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client } from "@/react-app/lib/hono";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";
import { queryClient } from "@/react-app/lib/query";

type Member = {
  userId: string;
  name: string;
  membershipId: string;
};

export function CreateCard({
  workspaceId,
  boardId,
  members,
}: {
  workspaceId: string;
  boardId: string;
  members: Member[];
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: {
      title: string;
      description: string;
      status: "todo" | "in_progress" | "done";
      dueDate: Date;
      membershipId: string | null;
    }) => {
      const res = await client.api.workspaces[":workspaceId"].boards[
        ":boardId"
      ].cards.$post({
        param: { workspaceId, boardId },
        json: {
          card: {
            title: data.title,
            description: data.description || "",
            status: data.status,
            dueDate: data.dueDate,
            assigneeMembershipId:
              data.membershipId === "unassigned" ? null : data.membershipId,
          },
        },
      });
      if (!res.ok) throw new Error("Failed to create card");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["cards", workspaceId, boardId],
      });
      setIsDialogOpen(false);
      toast.success("Card created");
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating card:", error);
      toast.error("An error occurred");
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      status: "todo" as "todo" | "in_progress" | "done",
      dueDate: "",
      membershipId: null as string | null,
    },
    validators: {
      onChange: z.object({
        title: z.string().min(1),
        description: z.string().max(1000, "Description is too long"),
        status: z.enum(["todo", "in_progress", "done"]),
        dueDate: z.string(),
        membershipId: z.string().nullable(),
      }),
    },
    onSubmit: async ({ value }) => {
      mutate({
        title: value.title,
        description: value.description,
        status: value.status,
        dueDate: new Date(value.dueDate),
        membershipId: value.membershipId,
      });
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>Create Card</Button>
      </DialogTrigger>
      <DialogContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Card</DialogTitle>
            <DialogDescription>Add a new card to the board.</DialogDescription>
          </DialogHeader>
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label htmlFor='title'>Title</Label>
              <form.Field
                name='title'
                validators={{
                  onChange: z.string().min(1, "Title is required"),
                }}
                children={(field) => (
                  <>
                    <Input
                      id='title'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <p className='text-sm text-red-500'>
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </>
                )}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='description'>Description</Label>
              <form.Field
                name='description'
                validators={{
                  onChange: z.string().max(1000, "Description is too long"),
                }}
                children={(field) => (
                  <>
                    <textarea
                      id='description'
                      className='flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <p className='text-sm text-red-500'>
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </>
                )}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='status'>Status</Label>
              <form.Field
                name='status'
                validators={{
                  onChange: z.enum(["todo", "in_progress", "done"]),
                }}
                children={(field) => (
                  <>
                    <Select
                      value={field.state.value}
                      onValueChange={(val: "todo" | "in_progress" | "done") =>
                        field.handleChange(val)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select status' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='todo'>Todo</SelectItem>
                        <SelectItem value='in_progress'>In Progress</SelectItem>
                        <SelectItem value='done'>Done</SelectItem>
                      </SelectContent>
                    </Select>
                    {field.state.meta.errors ? (
                      <p className='text-sm text-red-500'>
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </>
                )}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='dueDate'>Due Date</Label>
              <form.Field
                name='dueDate'
                validators={{
                  onChange: z.string().min(1, "Invalid date"),
                }}
                children={(field) => (
                  <>
                    <Input
                      id='dueDate'
                      type='datetime-local'
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {field.state.meta.errors ? (
                      <p className='text-sm text-red-500'>
                        {field.state.meta.errors.join(", ")}
                      </p>
                    ) : null}
                  </>
                )}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='assignee'>Assignee</Label>
              <form.Field
                name='membershipId'
                children={(field) => (
                  <Select
                    value={field.state.value || "unassigned"}
                    onValueChange={(val) => field.handleChange(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select assignee' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='unassigned'>Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.membershipId} value={m.membershipId}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <DialogFooter>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
              children={([canSubmit, isSubmitting]) => (
                <Button type='submit' disabled={!canSubmit || isSubmitting}>
                  {isSubmitting || isPending ? "Creating..." : "Create"}
                </Button>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
