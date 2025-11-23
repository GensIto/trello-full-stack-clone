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

export function CreateWorkspace() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const form = useForm({
    defaultValues: {
      workspaceName: "",
    },
    validators: {
      onChange: z.object({
        workspaceName: z.string().min(1),
      }),
    },
    onSubmit: async ({ value }) => {
      const response = await client.api.workspaces.$post({
        json: {
          name: value.workspaceName,
        },
      });
      if (!response.ok) {
        toast.error("Failed to create workspace");
        return;
      }

      toast.success("Workspace created successfully");
      form.reset();
      setIsDialogOpen(false);
    },
  });

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant='outline'>create workspace</Button>
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
            <DialogTitle>Create workspace</DialogTitle>
          </DialogHeader>
          <div className='grid gap-4'>
            <div className='grid gap-3'>
              <form.Field
                name='workspaceName'
                validators={{
                  onChange: ({ value }) =>
                    !value
                      ? "Workspace name is required"
                      : value.length < 1
                        ? "Workspace name must be at least 1 character"
                        : undefined,
                }}
                children={(field) => (
                  <>
                    <Label htmlFor={field.name}>Workspace Name</Label>
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
