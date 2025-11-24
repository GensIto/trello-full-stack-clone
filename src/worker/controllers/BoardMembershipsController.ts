import { Env, Hono } from "hono";
import { DependencyTypes } from "../container";
import { DIContainer } from "../di-container";
import { createAuth } from "../lib/auth";
import { BoardMembershipsService } from "../service/BoardMembershipsService";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { BoardMembership, BoardMembershipId } from "../domain/entities";
import { BoardId, MembershipId } from "../domain/value-object";
import { BoardService } from "../service/BoardService";

const app = new Hono<{
  Bindings: Env;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
    boardService: BoardService;
    boardMembershipsService: BoardMembershipsService;
    user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
    session: ReturnType<typeof createAuth>["$Infer"]["Session"]["session"];
  };
}>();

export const boardMembershipsRouter = app
  .post(
    "/",
    zValidator(
      "param",
      z.object({
        workspaceId: z.uuid(),
        boardId: z.uuid(),
      })
    ),
    zValidator("json", z.object({ membershipId: z.uuid() })),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const { membershipId } = c.req.valid("json");

      const userId = c.get("user").id;
      const boardService = c.get("boardService");

      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );

      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const boardMembershipsService = c.get("boardMembershipsService");
      await boardMembershipsService.addMemberToBoard(
        boardId,
        BoardMembership.of(
          BoardMembershipId.of(crypto.randomUUID()),
          BoardId.of(boardId),
          MembershipId.of(membershipId)
        )
      );
      return c.json({ message: "Board membership updated" });
    }
  )
  .delete(
    "/",
    zValidator(
      "param",
      z.object({
        workspaceId: z.uuid(),
        boardId: z.uuid(),
      })
    ),
    zValidator("json", z.object({ membershipId: z.uuid() })),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const { membershipId } = c.req.valid("json");
      const boardMembershipsService = c.get("boardMembershipsService");

      const userId = c.get("user").id;
      const boardService = c.get("boardService");

      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );

      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await boardMembershipsService.removeMemberFromBoard(
        boardId,
        BoardMembership.of(
          BoardMembershipId.of(crypto.randomUUID()),
          BoardId.of(boardId),
          MembershipId.of(membershipId)
        )
      );
      return c.json({ message: "Board membership removed" });
    }
  );
