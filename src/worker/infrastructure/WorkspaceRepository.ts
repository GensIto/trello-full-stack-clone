import { eq } from "drizzle-orm";
import { workspaces } from "../db/workspace-schema";
import { Workspace } from "../domain/entities";
import { UserId, WorkspaceId, WorkspaceName } from "../domain/value-object";
import { D1Transaction, DrizzleDb } from "../types";

export interface IWorkspaceRepository {
  findById(id: WorkspaceId): Promise<Workspace>;
  findByOwnerUserId(ownerUserId: UserId): Promise<Workspace[]>;
  create(workspace: Workspace): Promise<Workspace>;
  createBuilder(workspace: Workspace): D1Transaction;
  update(workspace: Workspace): Promise<Workspace>;
  delete(id: WorkspaceId): Promise<void>;
}

export class WorkspaceRepository implements IWorkspaceRepository {
  public constructor(private readonly db: DrizzleDb) {}

  async findById(id: WorkspaceId): Promise<Workspace> {
    const workspace = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.workspaceId, id.toString()))
      .get();

    if (!workspace) {
      throw new Error(`Workspace with id ${id.toString()} not found`);
    }

    return Workspace.of(
      WorkspaceId.of(workspace.workspaceId),
      WorkspaceName.of(workspace.name),
      UserId.of(workspace.ownerUserId)
    );
  }

  async findByOwnerUserId(ownerUserId: UserId): Promise<Workspace[]> {
    const results = await this.db
      .select()
      .from(workspaces)
      .where(eq(workspaces.ownerUserId, ownerUserId.toString()))
      .all();
    return results.map((workspace) =>
      Workspace.of(
        WorkspaceId.of(workspace.workspaceId),
        WorkspaceName.of(workspace.name),
        UserId.of(workspace.ownerUserId)
      )
    );
  }

  async create(workspace: Workspace): Promise<Workspace> {
    const result = await this.db
      .insert(workspaces)
      .values(workspace.toJson())
      .returning()
      .get();

    if (!result) {
      throw new Error(`Failed to create workspace`);
    }

    return Workspace.of(
      WorkspaceId.of(result.workspaceId),
      WorkspaceName.of(result.name),
      UserId.of(result.ownerUserId)
    );
  }

  createBuilder(workspace: Workspace) {
    return this.db.insert(workspaces).values(workspace.toJson()).returning();
  }

  async update(workspace: Workspace): Promise<Workspace> {
    const result = await this.db
      .update(workspaces)
      .set(workspace.toJson())
      .where(eq(workspaces.workspaceId, workspace.workspaceId.toString()))
      .returning()
      .get();

    if (!result) {
      throw new Error(`Failed to update workspace`);
    }

    return Workspace.of(
      WorkspaceId.of(result.workspaceId),
      WorkspaceName.of(result.name),
      UserId.of(result.ownerUserId)
    );
  }

  async delete(id: WorkspaceId): Promise<void> {
    await this.db
      .delete(workspaces)
      .where(eq(workspaces.workspaceId, id.toString()));
  }
}
