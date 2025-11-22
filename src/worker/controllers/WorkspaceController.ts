import { Hono } from "hono";
import { WorkspaceService } from "../service/WorkspaceService";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { DependencyTypes } from "../container";
import { DIContainer } from "../di-container";
import { Workspace } from "../domain/entities";
import { WorkspaceId, WorkspaceName, UserId } from "../domain/value-object";
import { createAuth } from "../lib/auth";
import { injectAuth } from "../middleware";

const app = new Hono<{
  Bindings: CloudflareBindings;
  Variables: {
    diContainer: DIContainer<DependencyTypes>;
    workspaceService: WorkspaceService;
    user: ReturnType<typeof createAuth>["$Infer"]["Session"]["user"];
    session: ReturnType<typeof createAuth>["$Infer"]["Session"]["session"];
  };
}>();

const createWorkspaceInputSchema = z.object({
  workspaceId: z.uuid(),
  name: z.string().min(1).max(100),
});

const findWorkspaceByIdInputSchema = z.object({
  id: z.string(),
});

const deleteWorkspaceInputSchema = z.object({
  id: z.string(),
});

const updateWorkspaceInputSchema = z.object({
  workspaceId: z.uuid(),
  name: z.string().min(1).max(100),
});

export const workspaceRouter = app
  .use("*", injectAuth)

  .post("/", zValidator("json", createWorkspaceInputSchema), async (c) => {
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
  })
  .get("/:id", zValidator("param", findWorkspaceByIdInputSchema), async (c) => {
    const { id } = c.req.valid("param");
    const workspaceService = c.get("workspaceService");
    const workspace = await workspaceService.findWorkspaceById(id);

    return c.json(workspace.toJson());
  })
  .delete(
    "/:id",
    zValidator("param", deleteWorkspaceInputSchema),
    async (c) => {
      const { id } = c.req.valid("param");
      const workspaceService = c.get("workspaceService");
      const userId = c.get("user").id;

      const workspace = await workspaceService.findWorkspaceById(id);
      if (!workspace.isOwnedBy(UserId.of(userId))) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      await workspaceService.deleteWorkspace(id);
      return c.json({ message: "Workspace deleted" });
    }
  )
  .put(
    "/:id",
    zValidator("param", findWorkspaceByIdInputSchema),
    zValidator("json", updateWorkspaceInputSchema),
    async (c) => {
      const { workspaceId, name } = c.req.valid("json");
      const workspaceService = c.get("workspaceService");

      const userId = c.get("user").id;

      const workspaceToUpdate =
        await workspaceService.findWorkspaceById(workspaceId);
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
  );
