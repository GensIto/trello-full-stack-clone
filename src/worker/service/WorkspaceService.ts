import { Workspace, WorkspaceMembership } from "../domain/entities";
import { WorkspaceId, WorkspaceName, UserId } from "../domain/value-object";
import { IWorkspaceMembershipsRepository } from "../infrastructure/WorkspaceMembershipsRepository";
import { IWorkspaceRepository } from "../infrastructure/WorkspaceRepository";
import { DrizzleDb } from "../types";

export interface IWorkspaceService {
  findWorkspaceById(id: WorkspaceId): Promise<Workspace>;
  findWorkspacesByOwnerUserId(ownerUserId: UserId): Promise<Workspace[]>;
  createWorkspace(workspace: Workspace): Promise<Workspace>;
  updateWorkspace(workspace: Workspace): Promise<Workspace>;
  deleteWorkspace(id: WorkspaceId): Promise<void>;
}

export class WorkspaceService implements IWorkspaceService {
  constructor(
    private workspaceRepository: IWorkspaceRepository,
    private workspaceMemberships: IWorkspaceMembershipsRepository,
    private db: DrizzleDb
  ) {}

  async findWorkspaceById(id: WorkspaceId): Promise<Workspace> {
    return this.workspaceRepository.findById(id);
  }

  async findWorkspacesByOwnerUserId(ownerUserId: UserId): Promise<Workspace[]> {
    return this.workspaceRepository.findByOwnerUserId(ownerUserId);
  }

  async createWorkspace(workspace: Workspace): Promise<Workspace> {
    const membership = WorkspaceMembership.createOwnerMembership(
      workspace.workspaceId,
      workspace.ownerUserId
    );

    const results = await this.db.batch([
      this.workspaceRepository.createBuilder(workspace),
      this.workspaceMemberships.createBuilder(membership),
    ]);

    const createdWorkspaceResult = results[0];
    if (!createdWorkspaceResult || createdWorkspaceResult.length === 0) {
      throw new Error("Failed to create workspace");
    }

    const createdWorkspace = createdWorkspaceResult[0];
    return Workspace.of(
      WorkspaceId.of(createdWorkspace.workspaceId),
      WorkspaceName.of(createdWorkspace.name),
      UserId.of(createdWorkspace.ownerUserId)
    );
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.update(workspace);
  }

  async deleteWorkspace(id: WorkspaceId): Promise<void> {
    return this.workspaceRepository.delete(id);
  }
}
