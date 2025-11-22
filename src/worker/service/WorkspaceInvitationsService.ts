import { WorkspaceInvitation } from "../domain/entities/WorkspaceInvitation";
import { WorkspaceMembership } from "../domain/entities";
import {
  InvitationId,
  WorkspaceId,
  UserId,
  EmailAddress,
  RoleId,
} from "../domain/value-object";
import { IWorkspaceInvitationsRepository } from "../infrastructure/WorkspaceInvitationsRepository";
import { IWorkspaceMembershipsRepository } from "../infrastructure/WorkspaceMembershipsRepository";
import { DrizzleDb } from "../types";

export interface IWorkspaceInvitationsService {
  createInvitation(
    workspaceId: WorkspaceId,
    invitedEmail: EmailAddress,
    invitedBy: UserId,
    roleId: RoleId
  ): Promise<WorkspaceInvitation>;
  getInvitationsByEmail(email: EmailAddress): Promise<WorkspaceInvitation[]>;
  getPendingInvitationsByEmail(
    email: EmailAddress
  ): Promise<WorkspaceInvitation[]>;
  getInvitationsByWorkspace(
    workspaceId: WorkspaceId
  ): Promise<WorkspaceInvitation[]>;
  acceptInvitation(
    invitationId: InvitationId,
    userId: UserId
  ): Promise<WorkspaceMembership>;
  rejectInvitation(invitationId: InvitationId): Promise<WorkspaceInvitation>;
  deleteInvitation(invitationId: InvitationId): Promise<void>;
}

export class WorkspaceInvitationsService
  implements IWorkspaceInvitationsService
{
  constructor(
    private readonly db: DrizzleDb,
    private readonly invitationsRepository: IWorkspaceInvitationsRepository,
    private readonly membershipsRepository: IWorkspaceMembershipsRepository
  ) {}

  async createInvitation(
    workspaceId: WorkspaceId,
    invitedEmail: EmailAddress,
    invitedBy: UserId,
    roleId: RoleId
  ): Promise<WorkspaceInvitation> {
    const invitation = WorkspaceInvitation.create(
      workspaceId,
      invitedEmail,
      invitedBy,
      roleId,
      7 // 7日間有効
    );

    return this.invitationsRepository.create(invitation);
  }

  async getInvitationsByEmail(
    email: EmailAddress
  ): Promise<WorkspaceInvitation[]> {
    return this.invitationsRepository.findByEmail(email);
  }

  async getPendingInvitationsByEmail(
    email: EmailAddress
  ): Promise<WorkspaceInvitation[]> {
    return this.invitationsRepository.findPendingByEmail(email);
  }

  async getInvitationsByWorkspace(
    workspaceId: WorkspaceId
  ): Promise<WorkspaceInvitation[]> {
    return this.invitationsRepository.findByWorkspaceId(workspaceId);
  }

  async acceptInvitation(
    invitationId: InvitationId,
    userId: UserId
  ): Promise<WorkspaceMembership> {
    // トランザクションで招待の受諾とメンバーシップ作成を実行
    return this.db.transaction(async (tx) => {
      const invitation = await this.invitationsRepository.findById(
        invitationId
      );

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (!invitation.canBeAccepted()) {
        throw new Error("Invitation cannot be accepted (expired or not pending)");
      }

      // 招待をacceptedに更新
      const acceptedInvitation = invitation.accept();
      await this.invitationsRepository.update(acceptedInvitation, tx);

      // メンバーシップを作成
      const membership = WorkspaceMembership.createMembership(
        invitation.workspaceId,
        userId,
        invitation.roleId
      );
      return this.membershipsRepository.create(membership, tx);
    });
  }

  async rejectInvitation(
    invitationId: InvitationId
  ): Promise<WorkspaceInvitation> {
    const invitation = await this.invitationsRepository.findById(invitationId);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    const rejectedInvitation = invitation.reject();
    return this.invitationsRepository.update(rejectedInvitation);
  }

  async deleteInvitation(invitationId: InvitationId): Promise<void> {
    return this.invitationsRepository.delete(invitationId);
  }
}
