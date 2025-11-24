import { IUserRepository } from "@/worker/infrastructure/UserRepository";
import { User, WorkspaceMembership } from "../domain/entities";
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
  ): Promise<{ membership: WorkspaceMembership; user: User }[]>;
  getMemberByWorkspaceAndUser(
    workspaceId: WorkspaceId,
    userId: UserId
  ): Promise<{ membership: WorkspaceMembership; user: User } | null>;
  updateMemberRole(
    workspaceMembership: WorkspaceMembership
  ): Promise<WorkspaceMembership>;
  deleteMember(workspaceMembership: WorkspaceMembership): Promise<void>;
}

export class WorkspaceMembershipsService
  implements IWorkspaceMembershipsService
{
  constructor(
    private workspaceMembershipsRepository: IWorkspaceMembershipsRepository,
    private userRepository: IUserRepository
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
  ): Promise<{ membership: WorkspaceMembership; user: User }[]> {
    const memberships =
      await this.workspaceMembershipsRepository.findByWorkspaceId(workspaceId);

    return Promise.all(
      memberships.map(async (membership) => {
        const user = await this.userRepository.findById(membership.userId);
        return {
          membership: membership,
          user: user,
        };
      })
    );
  }

  async getMemberByWorkspaceAndUser(
    workspaceId: WorkspaceId,
    userId: UserId
  ): Promise<{ membership: WorkspaceMembership; user: User } | null> {
    const membership =
      await this.workspaceMembershipsRepository.findByWorkspaceIdAndUserId(
        workspaceId,
        userId
      );
    const user = await this.userRepository.findById(userId);

    if (!membership || !user) {
      return null;
    }
    return {
      membership: membership,
      user: user,
    };
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
