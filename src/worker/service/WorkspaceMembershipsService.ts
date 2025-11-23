import { WorkspaceMembership } from "../domain/entities";
import { WorkspaceId, UserId, RoleId } from "../domain/value-object";
import { IWorkspaceMembershipsRepository } from "../infrastructure/WorkspaceMembershipsRepository";

export interface IWorkspaceMembershipsService {
  addMemberToWorkspace(
    workspaceId: WorkspaceId,
    userId: UserId,
    roleId: RoleId
  ): Promise<WorkspaceMembership>;
  getMembersByWorkspace(
    workspaceId: WorkspaceId
  ): Promise<WorkspaceMembership[]>;
  getMemberByWorkspaceAndUser(
    workspaceId: WorkspaceId,
    userId: UserId
  ): Promise<WorkspaceMembership | null>;
  updateMemberRole(
    workspaceMembership: WorkspaceMembership
  ): Promise<WorkspaceMembership>;
  deleteMember(workspaceMembership: WorkspaceMembership): Promise<void>;
}

export class WorkspaceMembershipsService
  implements IWorkspaceMembershipsService
{
  constructor(
    private workspaceMembershipsRepository: IWorkspaceMembershipsRepository
  ) {}

  async addMemberToWorkspace(
    workspaceId: WorkspaceId,
    userId: UserId,
    roleId: RoleId
  ): Promise<WorkspaceMembership> {
    return this.workspaceMembershipsRepository.create(
      WorkspaceMembership.createMembership(workspaceId, userId, roleId)
    );
  }

  async getMembersByWorkspace(
    workspaceId: WorkspaceId
  ): Promise<WorkspaceMembership[]> {
    return this.workspaceMembershipsRepository.findByWorkspaceId(workspaceId);
  }

  async getMemberByWorkspaceAndUser(
    workspaceId: WorkspaceId,
    userId: UserId
  ): Promise<WorkspaceMembership | null> {
    return this.workspaceMembershipsRepository.findByWorkspaceIdAndUserId(
      workspaceId,
      userId
    );
  }

  async updateMemberRole(
    workspaceMembership: WorkspaceMembership
  ): Promise<WorkspaceMembership> {
    return this.workspaceMembershipsRepository.update(workspaceMembership);
  }

  async deleteMember(workspaceMembership: WorkspaceMembership): Promise<void> {
    return this.workspaceMembershipsRepository.delete(
      workspaceMembership.workspaceId
    );
  }
}
