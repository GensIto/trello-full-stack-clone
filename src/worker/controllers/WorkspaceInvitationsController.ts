import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { DependencyTypes } from "../container";
import { DIContainer } from "../di-container";
import { createAuth } from "../lib/auth";
import { WorkspaceInvitationsService } from "../service/WorkspaceInvitationsService";
import {
  InvitationId,
  WorkspaceId,
  UserId,
  EmailAddress,
  RoleId,
} from "../domain/value-object";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
    workspaceInvitationsService: WorkspaceInvitationsService;
    user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
    session: ReturnType<typeof createAuth>["$Infer"]["Session"]["session"];
  };
}>();

export const workspaceInvitationsRouter = app
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        workspaceId: z.uuid(),
        invitedEmail: z.email(),
        roleId: z.number(),
      })
    ),
    async (c) => {
      const { workspaceId, invitedEmail, roleId } = c.req.valid("json");
      const workspaceInvitationsService = c.get("workspaceInvitationsService");
      const userId = c.get("user").id;

      try {
        const invitation = await workspaceInvitationsService.createInvitation(
          WorkspaceId.of(workspaceId),
          EmailAddress.of(invitedEmail),
          UserId.of(userId),
          RoleId.of(roleId)
        );

        return c.json(invitation.toJson(), 201);
      } catch (error) {
        return c.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          400
        );
      }
    }
  )
  .get("/", async (c) => {
    const workspaceInvitationsService = c.get("workspaceInvitationsService");
    const userEmail = c.get("user").email;

    try {
      const invitations =
        await workspaceInvitationsService.getInvitationsByEmail(
          EmailAddress.of(userEmail)
        );

      return c.json(invitations);
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        400
      );
    }
  })
  .post(
    "/accept",
    zValidator(
      "json",
      z.object({
        invitationId: z.uuid(),
      })
    ),
    async (c) => {
      const { invitationId } = c.req.valid("json");
      const workspaceInvitationsService = c.get("workspaceInvitationsService");
      const userId = c.get("user").id;

      try {
        const membership = await workspaceInvitationsService.acceptInvitation(
          InvitationId.of(invitationId),
          UserId.of(userId)
        );

        return c.json(membership.toJson());
      } catch (error) {
        return c.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          400
        );
      }
    }
  )
  .post(
    "/reject",
    zValidator(
      "json",
      z.object({
        invitationId: z.uuid(),
      })
    ),
    async (c) => {
      const { invitationId } = c.req.valid("json");
      const workspaceInvitationsService = c.get("workspaceInvitationsService");

      try {
        const invitation = await workspaceInvitationsService.rejectInvitation(
          InvitationId.of(invitationId)
        );

        return c.json(invitation.toJson());
      } catch (error) {
        return c.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          400
        );
      }
    }
  )

  .delete(
    "/:invitationId",
    zValidator(
      "param",
      z.object({
        invitationId: z.uuid(),
      })
    ),
    async (c) => {
      const { invitationId } = c.req.valid("param");
      const workspaceInvitationsService = c.get("workspaceInvitationsService");

      try {
        await workspaceInvitationsService.deleteInvitation(
          InvitationId.of(invitationId)
        );

        return c.json({ success: true });
      } catch (error) {
        return c.json(
          { error: error instanceof Error ? error.message : "Unknown error" },
          400
        );
      }
    }
  );
