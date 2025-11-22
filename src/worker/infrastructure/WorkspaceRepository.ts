import { eq } from "drizzle-orm";
import { workspaces } from "../db/workspace-schema";
import { Workspace } from "../domain/entities";
import { UserId, WorkspaceId, WorkspaceName } from "../domain/value-object";
import { DrizzleDb, DrizzleTransaction } from "../types";

export interface IWorkspaceRepository {
  findById(id: WorkspaceId): Promise<Workspace>;
  create(workspace: Workspace, tx: DrizzleTransaction): Promise<Workspace>;
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

  async create(workspace: Workspace, tx?: DrizzleTransaction): Promise<Workspace> {
    const db = tx ?? this.db;

    const result = await db
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
