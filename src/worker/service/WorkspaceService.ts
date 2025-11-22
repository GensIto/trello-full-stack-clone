import { Workspace, WorkspaceMembership } from "../domain/entities";
import { MembershipId, RoleId, WorkspaceId } from "../domain/value-object";
import { IWorkspaceMembershipsRepository } from "../infrastructure/WorkspaceMembershipsRepository";
import { IWorkspaceRepository } from "../infrastructure/WorkspaceRepository";
import { DrizzleDb } from "../types";

export interface IWorkspaceService {
  findWorkspaceById(id: string): Promise<Workspace>;
  createWorkspace(workspace: Workspace): Promise<Workspace>;
  updateWorkspace(workspace: Workspace): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
}

export class WorkspaceService implements IWorkspaceService {
  constructor(
    private workspaceRepository: IWorkspaceRepository,
    private workspaceMemberships: IWorkspaceMembershipsRepository,
    private db: DrizzleDb
  ) {}

  async findWorkspaceById(id: string): Promise<Workspace> {
    return this.workspaceRepository.findById(WorkspaceId.of(id));
  }

  async createWorkspace(workspace: Workspace): Promise<Workspace> {
    return await this.db.transaction(async () => {
      const createdWorkspace = await this.workspaceRepository.create(workspace);

      const membership = WorkspaceMembership.of(
        MembershipId.of(crypto.randomUUID()),
        createdWorkspace.workspaceId,
        workspace.ownerUserId,
        RoleId.OWNER
      );
      await this.workspaceMemberships.create(membership);

      return createdWorkspace;
    });
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.update(workspace);
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.workspaceRepository.delete(WorkspaceId.of(id));
  }
}
