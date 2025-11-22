import { Workspace, WorkspaceMembership } from "../domain/entities";
import { WorkspaceId } from "../domain/value-object";
import { IWorkspaceMembershipsRepository } from "../infrastructure/WorkspaceMembershipsRepository";
import { IWorkspaceRepository } from "../infrastructure/WorkspaceRepository";
import { DrizzleDb } from "../types";

export interface IWorkspaceService {
  findWorkspaceById(id: WorkspaceId): Promise<Workspace>;
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

  async createWorkspace(workspace: Workspace): Promise<Workspace> {
    return await this.db.transaction(async (tx) => {
      const createdWorkspace = await this.workspaceRepository.create(
        workspace,
        tx
      );

      const membership = WorkspaceMembership.createOwnerMembership(
        createdWorkspace.workspaceId,
        createdWorkspace.ownerUserId
      );
      await this.workspaceMemberships.create(membership, tx);

      return createdWorkspace;
    });
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.update(workspace);
  }

  async deleteWorkspace(id: WorkspaceId): Promise<void> {
    return this.workspaceRepository.delete(id);
  }
}
