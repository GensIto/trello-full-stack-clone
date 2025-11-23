import { Hono } from "hono";
import { WorkspaceService } from "../service/WorkspaceService";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { DependencyTypes } from "../container";
import { DIContainer } from "../di-container";
import { Workspace } from "../domain/entities";
import { WorkspaceId, WorkspaceName, UserId } from "../domain/value-object";
import { createAuth } from "../lib/auth";
import { boardRouter } from "./BoardController";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
    workspaceService: WorkspaceService;
    user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
    session: ReturnType<typeof createAuth>["$Infer"]["Session"]["session"];
  };
}>();

export const workspaceRouter = app
  .post(
    "/",
    zValidator(
      "json",
      z.object({
        workspaceId: z.uuid(),
        name: z.string().min(1).max(100),
      })
    ),
    async (c) => {
      const { workspaceId, name } = c.req.valid("json");
      const workspaceService = c.get("workspaceService");

      const userId = c.get("user").id;

      const workspace = await workspaceService.createWorkspace(
        Workspace.of(
          WorkspaceId.of(workspaceId),
          WorkspaceName.of(name),
          UserId.of(userId)
        )
      );
      return c.json(workspace.toJson());
    }
  )
  .get(
    "/:workspaceId",
    zValidator("param", z.object({ workspaceId: z.uuid() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const workspaceService = c.get("workspaceService");
      const workspace = await workspaceService.findWorkspaceById(
        WorkspaceId.of(workspaceId)
      );

      return c.json(workspace.toJson());
    }
  )
  .delete(
    "/:workspaceId",
    zValidator("param", z.object({ workspaceId: z.uuid() })),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const workspaceService = c.get("workspaceService");
      const userId = c.get("user").id;

      const workspace = await workspaceService.findWorkspaceById(
        WorkspaceId.of(workspaceId)
      );
      if (!workspace.isOwnedBy(UserId.of(userId))) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await workspaceService.deleteWorkspace(WorkspaceId.of(workspaceId));
      return c.json({ message: "Workspace deleted" });
    }
  )
  .put(
    "/:workspaceId",
    zValidator("param", z.object({ workspaceId: z.uuid() })),
    zValidator(
      "json",
      z.object({
        workspaceId: z.uuid(),
        name: z.string().min(1).max(100),
      })
    ),
    async (c) => {
      const { workspaceId } = c.req.valid("param");
      const { name } = c.req.valid("json");
      const workspaceService = c.get("workspaceService");

      const userId = c.get("user").id;

      const workspaceToUpdate = await workspaceService.findWorkspaceById(
        WorkspaceId.of(workspaceId)
      );
      if (!workspaceToUpdate.isOwnedBy(UserId.of(userId))) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const workspace = await workspaceService.updateWorkspace(
        Workspace.of(
          WorkspaceId.of(workspaceId),
          WorkspaceName.of(name),
          UserId.of(userId)
        )
      );

      return c.json(workspace.toJson());
    }
  )
  .route("/:workspaceId/boards", boardRouter);
