import { z } from "zod";
import {
  InvitationId,
  InvitationStatus,
  WorkspaceId,
  UserId,
  EmailAddress,
  RoleId,
} from "../value-object";

const workspaceInvitationSchema = z.object({
  invitationId: z.custom<InvitationId>(
    (val) => val instanceof InvitationId,
    "Invalid invitation ID"
  ),
  workspaceId: z.custom<WorkspaceId>(
    (val) => val instanceof WorkspaceId,
    "Invalid workspace ID"
  ),
  invitedEmail: z.custom<EmailAddress>(
    (val) => val instanceof EmailAddress,
    "Invalid email address"
  ),
  invitedBy: z.custom<UserId>(
    (val) => val instanceof UserId,
    "Invalid user ID"
  ),
  roleId: z.custom<RoleId>((val) => val instanceof RoleId, "Invalid role ID"),
  status: z.custom<InvitationStatus>(
    (val) => val instanceof InvitationStatus,
    "Invalid invitation status"
  ),
  expiresAt: z.date(),
});

export class WorkspaceInvitation {
  private constructor(
    public readonly invitationId: InvitationId,
    public readonly workspaceId: WorkspaceId,
    public readonly invitedEmail: EmailAddress,
    public readonly invitedBy: UserId,
    public readonly roleId: RoleId,
    public readonly status: InvitationStatus,
    public readonly expiresAt: Date
  ) {}

  static of(
    invitationId: InvitationId,
    workspaceId: WorkspaceId,
    invitedEmail: EmailAddress,
    invitedBy: UserId,
    roleId: RoleId,
    status: InvitationStatus,
    expiresAt: Date
  ): WorkspaceInvitation {
    const validated = workspaceInvitationSchema.parse({
      invitationId,
      workspaceId,
      invitedEmail,
      invitedBy,
      roleId,
      status,
      expiresAt,
    });
    return new WorkspaceInvitation(
      validated.invitationId,
      validated.workspaceId,
      validated.invitedEmail,
      validated.invitedBy,
      validated.roleId,
      validated.status,
      validated.expiresAt
    );
  }

  static tryOf(
    invitationId: InvitationId,
    workspaceId: WorkspaceId,
    invitedEmail: EmailAddress,
    invitedBy: UserId,
    roleId: RoleId,
    status: InvitationStatus,
    expiresAt: Date
  ):
    | { success: true; value: WorkspaceInvitation }
    | { success: false; error: string } {
    const result = workspaceInvitationSchema.safeParse({
      invitationId,
      workspaceId,
      invitedEmail,
      invitedBy,
      roleId,
      status,
      expiresAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new WorkspaceInvitation(
          result.data.invitationId,
          result.data.workspaceId,
          result.data.invitedEmail,
          result.data.invitedBy,
          result.data.roleId,
          result.data.status,
          result.data.expiresAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  static create(
    workspaceId: WorkspaceId,
    invitedEmail: EmailAddress,
    invitedBy: UserId,
    roleId: RoleId,
    expiresInDays: number = 7
  ): WorkspaceInvitation {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    return new WorkspaceInvitation(
      InvitationId.of(crypto.randomUUID()),
      workspaceId,
      invitedEmail,
      invitedBy,
      roleId,
      InvitationStatus.of("pending"),
      expiresAt
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isPending(): boolean {
    return this.status.isPending();
  }

  isAccepted(): boolean {
    return this.status.isAccepted();
  }

  isRejected(): boolean {
    return this.status.isRejected();
  }

  canBeAccepted(): boolean {
    return this.isPending() && !this.isExpired();
  }

  accept(): WorkspaceInvitation {
    if (!this.canBeAccepted()) {
      throw new Error("Cannot accept invitation: either expired or not pending");
    }
    return new WorkspaceInvitation(
      this.invitationId,
      this.workspaceId,
      this.invitedEmail,
      this.invitedBy,
      this.roleId,
      InvitationStatus.of("accepted"),
      this.expiresAt
    );
  }

  reject(): WorkspaceInvitation {
    if (!this.isPending()) {
      throw new Error("Cannot reject invitation: not pending");
    }
    return new WorkspaceInvitation(
      this.invitationId,
      this.workspaceId,
      this.invitedEmail,
      this.invitedBy,
      this.roleId,
      InvitationStatus.of("rejected"),
      this.expiresAt
    );
  }

  belongsToWorkspace(workspaceId: WorkspaceId): boolean {
    return this.workspaceId.equals(workspaceId);
  }

  isForEmail(email: EmailAddress): boolean {
    return this.invitedEmail.equals(email);
  }

  toJson(): {
    invitationId: string;
    workspaceId: string;
    invitedEmail: string;
    invitedBy: string;
    roleId: string;
    status: string;
    expiresAt: string;
  } {
    return {
      invitationId: this.invitationId.toString(),
      workspaceId: this.workspaceId.toString(),
      invitedEmail: this.invitedEmail.toString(),
      invitedBy: this.invitedBy.toString(),
      roleId: this.roleId.toString(),
      status: this.status.toString(),
      expiresAt: this.expiresAt.toISOString(),
    };
  }
}
