import { WorkspaceInvitation } from "../domain/entities/WorkspaceInvitation";
import { WorkspaceMembership } from "../domain/entities";
import {
  InvitationId,
  WorkspaceId,
  UserId,
  EmailAddress,
  RoleId,
  MembershipId,
} from "../domain/value-object";
import { IWorkspaceInvitationsRepository } from "../infrastructure/WorkspaceInvitationsRepository";
import { IWorkspaceRepository } from "../infrastructure/WorkspaceRepository";
import { DrizzleDb } from "../types";
import {
  workspaceInvitations,
  workspaceMemberships,
} from "../db/workspace-schema";
import { eq } from "drizzle-orm";

export interface IWorkspaceInvitationsService {
  createInvitation(
    workspaceId: WorkspaceId,
    invitedEmail: EmailAddress,
    invitedBy: UserId,
    roleId: RoleId
  ): Promise<WorkspaceInvitation>;
  getInvitationsByEmail(email: EmailAddress): Promise<
    Array<{
      invitationId: string;
      workspaceId: string;
      workspaceName: string;
      invitedEmail: string;
      invitedBy: string;
      roleId: string;
      status: string;
      expiresAt: string;
    }>
  >;
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
    private readonly workspaceRepository: IWorkspaceRepository
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

  async getInvitationsByEmail(email: EmailAddress): Promise<
    Array<{
      invitationId: string;
      workspaceId: string;
      workspaceName: string;
      invitedEmail: string;
      invitedBy: string;
      roleId: string;
      status: string;
      expiresAt: string;
    }>
  > {
    const invitations = await this.invitationsRepository.findByEmail(email);

    const withWorkspaceNames = await Promise.all(
      invitations.map(async (invitation) => {
        try {
          const workspace = await this.workspaceRepository.findById(
            invitation.workspaceId
          );
          return {
            ...invitation.toJson(),
            workspaceName: workspace.name.toString(),
          };
        } catch {
          return {
            ...invitation.toJson(),
            workspaceName: "Unknown Workspace",
          };
        }
      })
    );

    return withWorkspaceNames;
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
    const invitation = await this.invitationsRepository.findById(invitationId);

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (!invitation.canBeAccepted()) {
      throw new Error("Invitation cannot be accepted (expired or not pending)");
    }

    // 招待をacceptedに更新
    const acceptedInvitation = invitation.accept();

    // メンバーシップを作成
    const membership = WorkspaceMembership.createMembership(
      invitation.workspaceId,
      userId,
      invitation.roleId
    );

    // D1のbatch()を使用して複数のクエリを一度に実行
    const results = await this.db.batch([
      this.db
        .update(workspaceInvitations)
        .set({
          status: acceptedInvitation.status.value,
          updatedAt: new Date(),
        })
        .where(eq(workspaceInvitations.invitationId, invitationId.toString()))
        .returning(),
      this.db
        .insert(workspaceMemberships)
        .values({
          membershipId: membership.membershipId.toString(),
          workspaceId: membership.workspaceId.toString(),
          userId: membership.userId.toString(),
          roleId: membership.roleId.value,
        })
        .returning(),
    ]);

    const createdMembershipResult = results[1];
    if (!createdMembershipResult || createdMembershipResult.length === 0) {
      throw new Error("Failed to create workspace membership");
    }

    const createdMembershipData = createdMembershipResult[0];
    return WorkspaceMembership.of(
      MembershipId.of(createdMembershipData.membershipId),
      WorkspaceId.of(createdMembershipData.workspaceId),
      UserId.of(createdMembershipData.userId),
      RoleId.of(createdMembershipData.roleId)
    );
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
