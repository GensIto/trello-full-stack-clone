import { createFileRoute, redirect } from "@tanstack/react-router";
import { authClient } from "../../lib/betterAuth";
import { client } from "../../lib/hono";

export const Route = createFileRoute("/my-page/")({
  component: MyPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (session.data) {
      throw redirect({ to: "/", replace: true });
    }
  },
  loader: async () => {
    const invitations = await client.api.invitations.$get();
    const data = await invitations.json();
    return { invitations: data };
  },
});

function MyPage() {
  const { invitations } = Route.useLoaderData();

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
    <div className='flex min-h-screen items-center justify-center'>
      <h1>My Page</h1>
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
  );
}
