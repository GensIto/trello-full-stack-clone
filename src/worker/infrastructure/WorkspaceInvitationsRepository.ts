import { and, eq } from "drizzle-orm";
import { workspaceInvitations } from "../db/workspace-schema";
import { WorkspaceInvitation } from "../domain/entities/WorkspaceInvitation";
import {
  InvitationId,
  InvitationStatus,
  WorkspaceId,
  UserId,
  EmailAddress,
  RoleId,
} from "../domain/value-object";
import { DrizzleDb } from "../types";

export interface IWorkspaceInvitationsRepository {
  findById(id: InvitationId): Promise<WorkspaceInvitation | null>;
  findByEmail(email: EmailAddress): Promise<WorkspaceInvitation[]>;
  findByWorkspaceId(workspaceId: WorkspaceId): Promise<WorkspaceInvitation[]>;
  findPendingByEmail(email: EmailAddress): Promise<WorkspaceInvitation[]>;
  create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
  update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation>;
  delete(id: InvitationId): Promise<void>;
}

export class WorkspaceInvitationsRepository
  implements IWorkspaceInvitationsRepository
{
  public constructor(private readonly db: DrizzleDb) {}

  async findById(id: InvitationId): Promise<WorkspaceInvitation | null> {
    const result = await this.db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.invitationId, id.toString()))
      .get();

    if (!result) {
      return null;
    }

    return WorkspaceInvitation.of(
      InvitationId.of(result.invitationId),
      WorkspaceId.of(result.workspaceId),
      EmailAddress.of(result.invitedEmail),
      UserId.of(result.invitedBy),
      RoleId.of(result.roleId),
      InvitationStatus.of(result.status),
      new Date(result.expiresAt)
    );
  }

  async findByEmail(email: EmailAddress): Promise<WorkspaceInvitation[]> {
    const results = await this.db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.invitedEmail, email.toString()))
      .all();

    return results.map((result) =>
      WorkspaceInvitation.of(
        InvitationId.of(result.invitationId),
        WorkspaceId.of(result.workspaceId),
        EmailAddress.of(result.invitedEmail),
        UserId.of(result.invitedBy),
        RoleId.of(result.roleId),
        InvitationStatus.of(result.status),
        new Date(result.expiresAt)
      )
    );
  }

  async findByWorkspaceId(
    workspaceId: WorkspaceId
  ): Promise<WorkspaceInvitation[]> {
    const results = await this.db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.workspaceId, workspaceId.toString()))
      .all();

    return results.map((result) =>
      WorkspaceInvitation.of(
        InvitationId.of(result.invitationId),
        WorkspaceId.of(result.workspaceId),
        EmailAddress.of(result.invitedEmail),
        UserId.of(result.invitedBy),
        RoleId.of(result.roleId),
        InvitationStatus.of(result.status),
        new Date(result.expiresAt)
      )
    );
  }

  async findPendingByEmail(
    email: EmailAddress
  ): Promise<WorkspaceInvitation[]> {
    const results = await this.db
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.invitedEmail, email.toString()),
          eq(workspaceInvitations.status, "pending")
        )
      )
      .all();

    return results.map((result) =>
      WorkspaceInvitation.of(
        InvitationId.of(result.invitationId),
        WorkspaceId.of(result.workspaceId),
        EmailAddress.of(result.invitedEmail),
        UserId.of(result.invitedBy),
        RoleId.of(result.roleId),
        InvitationStatus.of(result.status),
        new Date(result.expiresAt)
      )
    );
  }

  async create(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    const result = await this.db
      .insert(workspaceInvitations)
      .values({
        invitationId: invitation.invitationId.toString(),
        workspaceId: invitation.workspaceId.toString(),
        invitedEmail: invitation.invitedEmail.toString(),
        invitedBy: invitation.invitedBy.toString(),
        roleId: invitation.roleId.value,
        status: invitation.status.value,
        expiresAt: invitation.expiresAt,
      })
      .returning()
      .get();

    if (!result) {
      throw new Error("Failed to create workspace invitation");
    }

    return WorkspaceInvitation.of(
      InvitationId.of(result.invitationId),
      WorkspaceId.of(result.workspaceId),
      EmailAddress.of(result.invitedEmail),
      UserId.of(result.invitedBy),
      RoleId.of(result.roleId),
      InvitationStatus.of(result.status),
      new Date(result.expiresAt)
    );
  }

  async update(invitation: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    const result = await this.db
      .update(workspaceInvitations)
      .set({
        status: invitation.status.value,
      })
      .where(
        eq(
          workspaceInvitations.invitationId,
          invitation.invitationId.toString()
        )
      )
      .returning()
      .get();

    if (!result) {
      throw new Error("Failed to update workspace invitation");
    }

    return WorkspaceInvitation.of(
      InvitationId.of(result.invitationId),
      WorkspaceId.of(result.workspaceId),
      EmailAddress.of(result.invitedEmail),
      UserId.of(result.invitedBy),
      RoleId.of(result.roleId),
      InvitationStatus.of(result.status),
      new Date(result.expiresAt)
    );
  }

  async delete(id: InvitationId): Promise<void> {
    await this.db
      .delete(workspaceInvitations)
      .where(eq(workspaceInvitations.invitationId, id.toString()));
  }
}
