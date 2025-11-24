import {
  createFileRoute,
  Link,
  redirect,
  useRouter,
} from "@tanstack/react-router";
import { authClient } from "../../lib/betterAuth";
import { client } from "../../lib/hono";
import { CreateWorkspace } from "@/react-app/features/my-page/CreateWorkspace";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/my-page/")({
  component: MyPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect({ to: "/auth/sign-in", replace: true });
    }
  },
  loader: async () => {
    const invitations = await client.api.invitations.$get();
    const invitationsData = await invitations.json();

    const workspaces = await client.api.workspaces.$get();
    const workspacesData = await workspaces.json();

    return { invitations: invitationsData, workspaces: workspacesData };
  },
});

function MyPage() {
  const { invitations, workspaces } = Route.useLoaderData();
  const router = useRouter();

  const handleAcceptInvitation = async (invitationId: string) => {
    const response = await client.api.invitations.accept.$post({
      json: { invitationId },
    });
    if (!response.ok) {
      toast.error("Failed to accept invitation");
      return;
    }
    const invitation = await response.json();
    toast.success("Invitation accepted");
    router.navigate({ to: `/workspaces/${invitation.workspaceId}` });
  };

  const handleRejectInvitation = async (invitationId: string) => {
    const response = await client.api.invitations.reject.$post({
      json: { invitationId },
    });
    if (!response.ok) {
      toast.error("Failed to accept invitation");
      return;
    }
    toast.success("Invitation rejected");
    router.invalidate();
    router.navigate({ to: "/my-page" });
  };

  if ("error" in invitations) {
    return <div>Error: {invitations.error}</div>;
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-start gap-8'>
      <div className='flex gap-4 w-full justify-between items-center'>
        <h1>My Page</h1>
        <CreateWorkspace />
      </div>
      <div className='w-full space-y-4'>
        <h2>My Workspaces</h2>
        <div className='grid grid-cols-3 gap-4'>
          {workspaces.map((workspace) => (
            <Link
              key={workspace.workspaceId}
              to={"/workspaces/$workspaceId"}
              params={{ workspaceId: workspace.workspaceId }}
            >
              <div className='border border-gray-200 rounded-md p-4'>
                <h2>{workspace.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className='w-full space-y-4'>
        <h2>Joined Workspaces</h2>
        <div className='grid grid-cols-3 gap-4'>
          {invitations.length === 0 && (
            <div className='col-span-3 text-center'>No invitations</div>
          )}
          {invitations.map((invitation) => (
            <div
              key={invitation.invitationId}
              className='border border-gray-200 rounded-md p-4 relative space-y-2'
            >
              {invitation.status === "pending" && (
                <Badge
                  animate-ping
                  className={cn(
                    "absolute -top-1 -right-1 h-3 w-3 rounded-full px-1 font-mono tabular-nums",
                    invitation.status === "pending" && "animate-ping"
                  )}
                  variant='default'
                />
              )}
              <h2>
                {invitation.workspaceName}
                {invitation.status === "pending" && "に招待されました"}
              </h2>
              {invitation.status === "pending" ? (
                <div className='flex gap-2'>
                  <Button
                    onClick={() =>
                      handleAcceptInvitation(invitation.invitationId)
                    }
                  >
                    Accept
                  </Button>
                  <Button
                    variant='outline'
                    onClick={() =>
                      handleRejectInvitation(invitation.invitationId)
                    }
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                <Link
                  to={"/workspaces/$workspaceId"}
                  params={{ workspaceId: invitation.workspaceId }}
                  className='w-full'
                >
                  <Button className='w-full' variant='outline'>
                    View Workspace
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
