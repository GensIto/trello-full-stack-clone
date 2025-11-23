import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { authClient } from "../../lib/betterAuth";
import { client } from "../../lib/hono";
import { CreateWorkspace } from "@/react-app/features/my-page/CreateWorkspace";

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

  const handleAcceptInvitation = async (invitationId: string) => {
    const response = await client.api.invitations.accept.$post({
      json: { invitationId },
    });

    const data = await response.json();
    return data;
  };

  const handleRejectInvitation = async (invitationId: string) => {
    const response = await client.api.invitations.reject.$post({
      json: { invitationId },
    });
    const data = await response.json();
    return data;
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
      <div>
        <h2>My Workspaces</h2>
        <div>
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
      <div>
        <h2>Joined Workspaces</h2>
        <div>
          {invitations.length === 0 && <div>No invitations</div>}
          {invitations.map((invitation) => (
            <div key={invitation.invitationId}>
              <h2>{invitation.invitedEmail}</h2>
              <button
                onClick={() => handleAcceptInvitation(invitation.invitationId)}
              >
                Accept
              </button>
              <button
                onClick={() => handleRejectInvitation(invitation.invitationId)}
              >
                Reject
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
