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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { client } from "@/react-app/lib/hono";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import { useMutation } from "@tanstack/react-query";
import { RoleId } from "@/worker/domain/value-object";

export function InviteMember({ workspaceId }: { workspaceId: string }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { mutate: inviteMember } = useMutation({
    mutationFn: async ({
      value,
    }: {
      value: { invitedEmail: string; roleId: number };
    }) => {
      const res = await client.api.invitations.$post({
        json: {
          workspaceId: workspaceId,
          invitedEmail: value.invitedEmail,
          roleId: value.roleId,
        },
      });
      return res.json();
    },
    onSuccess: async () => {
      toast.success("Member invited successfully");
      form.reset();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Error inviting member:", error);
      toast.error("An error occurred while inviting the member");
    },
  });

  const form = useForm({
    defaultValues: {
      invitedEmail: "",
      roleId: 1,
    },
    validators: {
      onChange: z.object({
        invitedEmail: z.email(),
        roleId: z.number().min(1, "Role is required"),
      }),
    },
    onSubmit: inviteMember,
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
                name='invitedEmail'
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Email is required"
                      : value.length < 1
                        ? "Email must be at least 1 character"
                        : undefined,
                }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Email</Label>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      type='email'
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {!field.state.meta.isValid && (
                      <em>{field.state.meta.errors.join(",")}</em>
                    )}
                  </>
                )}
              />
              <form.Field
                name='roleId'
                mode='array'
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Role</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={RoleId.ADMIN.toString()}>
                          Admin
                        </SelectItem>
                        <SelectItem value={RoleId.MEMBER.toString()}>
                          Member
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {!field.state.meta.isValid && (
                      <em className='text-red-500'>
                        {field.state.meta.errors.join(", ")}
                      </em>
                    )}
                  </>
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
