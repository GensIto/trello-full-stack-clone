import { Hono } from "hono";
import { DependencyTypes } from "../container";
import { DIContainer } from "../di-container";
import { createAuth } from "../lib/auth";
import { BoardService } from "../service/BoardService";
import { BoardQueryService } from "../service/BoardQueryService";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { boardMembershipsRouter } from "./BoardMembershipsController";
import { cardRouter } from "./CardController";
import { WorkspaceId } from "@/worker/domain/value-object";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
    boardService: BoardService;
    boardQueryService: BoardQueryService;
    user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
    session: ReturnType<typeof createAuth>["$Infer"]["Session"]["session"];
  };
}>();

export const boardRouter = app
  .post(
    "/",
    zValidator(
      "param",
      z.object({
        workspaceId: z.uuid(),
      })
    ),
    zValidator(
      "json",
      z.object({
        name: z.string().min(1).max(100),
        membershipIds: z.array(z.uuid()),
      })
    ),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const { name, membershipIds } = c.req.valid("json");
      const userId = c.get("user").id;
      const boardService = c.get("boardService");

      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );

      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const board = await boardService.createBoard(
        workspaceId,
        name,
        membershipIds
      );
      return c.json(board.toJson());
    }
  )
  .get(
    "/",
    zValidator("param", z.object({ workspaceId: z.uuid() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const boardService = c.get("boardService");
      const boardQueryService = c.get("boardQueryService");

      const boards = await boardService.findBoardsByWorkspaceId(workspaceId);

      const results = await Promise.all(
        boards.map(async (board) => {
          const result = await boardQueryService.getBoardWithMembers(
            WorkspaceId.of(workspaceId),
            board.boardId
          );
          return result;
        })
      );

      const boardsWithMembers = results.map((result) => ({
        ...result.board.toJson(),
        members: result.members.map((member) => member.toJson()),
      }));

      return c.json(boardsWithMembers);
    }
  )
  .get(
    "/:boardId",
    zValidator("param", z.object({ workspaceId: z.uuid(), boardId: z.uuid() })),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const boardService = c.get("boardService");
      const boardQueryService = c.get("boardQueryService");

      const board = await boardService.findBoardById(workspaceId, boardId);

      const result = await boardQueryService.getBoardWithMembers(
        WorkspaceId.of(workspaceId),
        board.boardId
      );
      return c.json({
        ...result.board.toJson(),
        members: result.members.map((member) => member.toJson()),
      });
    }
  )
  .put(
    "/:boardId",
    zValidator("param", z.object({ workspaceId: z.uuid(), boardId: z.uuid() })),
    zValidator("json", z.object({ name: z.string().min(1).max(100) })),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const { name } = c.req.valid("json");
      const userId = c.get("user").id;
      const boardService = c.get("boardService");

      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );

      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const board = await boardService.updateBoard(workspaceId, boardId, name);
      return c.json(board.toJson());
    }
  )
  .delete(
    "/:boardId",
    zValidator("param", z.object({ workspaceId: z.uuid(), boardId: z.uuid() })),
    async (c) => {
      const { workspaceId, boardId } = c.req.valid("param");
      const userId = c.get("user").id;
      const boardService = c.get("boardService");

      const hasPermission = await boardService.canManageBoard(
        workspaceId,
        userId
      );

      if (!hasPermission) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await boardService.deleteBoard(workspaceId, boardId);
      return c.json({ message: "Board deleted" });
    }
  )
  .route("/:boardId/memberships", boardMembershipsRouter)
  .route("/:boardId/cards", cardRouter);
