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

const createInvitationInputSchema = z.object({
  workspaceId: z.uuid(),
  invitedEmail: z.string().email(),
  roleId: z.number(),
});

const acceptInvitationInputSchema = z.object({
  invitationId: z.uuid(),
});

const rejectInvitationInputSchema = z.object({
  invitationId: z.uuid(),
});

const deleteInvitationInputSchema = z.object({
  invitationId: z.uuid(),
});

export const workspaceInvitationsRouter = app
  .post("/", zValidator("json", createInvitationInputSchema), async (c) => {
    // 招待を作成
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
  })
  .get("/", async (c) => {
    // 自分宛の招待一覧を取得
    const workspaceInvitationsService = c.get("workspaceInvitationsService");
    const userEmail = c.get("user").email;

    try {
      const invitations =
        await workspaceInvitationsService.getPendingInvitationsByEmail(
          EmailAddress.of(userEmail)
        );

      return c.json(invitations.map((inv) => inv.toJson()));
    } catch (error) {
      return c.json(
        { error: error instanceof Error ? error.message : "Unknown error" },
        400
      );
    }
  })
  .post(
    "/accept",
    zValidator("json", acceptInvitationInputSchema),
    async (c) => {
      // 招待を受諾
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
    zValidator("json", rejectInvitationInputSchema),
    async (c) => {
      // 招待を拒否
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

  // 招待を削除
  .delete(
    "/:invitationId",
    zValidator("param", deleteInvitationInputSchema),
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
