import { z } from "zod";
import {
  MembershipId,
  WorkspaceId,
  UserId,
  RoleId,
} from "../../value-object";

const workspaceMembershipSchema = z.object({
  membershipId: z.custom<MembershipId>(
    (val) => val instanceof MembershipId,
    "Invalid membership ID"
  ),
  workspaceId: z.custom<WorkspaceId>(
    (val) => val instanceof WorkspaceId,
    "Invalid workspace ID"
  ),
  userId: z.custom<UserId>((val) => val instanceof UserId, "Invalid user ID"),
  roleId: z.custom<RoleId>((val) => val instanceof RoleId, "Invalid role ID"),
});

export class WorkspaceMembership {
  private constructor(
    public readonly membershipId: MembershipId,
    public readonly workspaceId: WorkspaceId,
    public readonly userId: UserId,
    public readonly roleId: RoleId
  ) {}

  static of(
    membershipId: MembershipId,
    workspaceId: WorkspaceId,
    userId: UserId,
    roleId: RoleId
  ): WorkspaceMembership {
    const validated = workspaceMembershipSchema.parse({
      membershipId,
      workspaceId,
      userId,
      roleId,
    });
    return new WorkspaceMembership(
      validated.membershipId,
      validated.workspaceId,
      validated.userId,
      validated.roleId
    );
  }

  static tryOf(
    membershipId: MembershipId,
    workspaceId: WorkspaceId,
    userId: UserId,
    roleId: RoleId
  ):
    | { success: true; value: WorkspaceMembership }
    | { success: false; error: string } {
    const result = workspaceMembershipSchema.safeParse({
      membershipId,
      workspaceId,
      userId,
      roleId,
    });
    if (result.success) {
      return {
        success: true,
        value: new WorkspaceMembership(
          result.data.membershipId,
          result.data.workspaceId,
          result.data.userId,
          result.data.roleId
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  static createOwnerMembership(
    workspaceId: WorkspaceId,
    userId: UserId
  ): WorkspaceMembership {
    return new WorkspaceMembership(
      MembershipId.of(crypto.randomUUID()),
      workspaceId,
      userId,
      RoleId.OWNER
    );
  }

  static createMembership(
    workspaceId: WorkspaceId,
    userId: UserId,
    roleId: RoleId
  ): WorkspaceMembership {
    return new WorkspaceMembership(
      MembershipId.of(crypto.randomUUID()),
      workspaceId,
      userId,
      roleId
    );
  }

  belongsToWorkspace(workspaceId: WorkspaceId): boolean {
    return this.workspaceId.equals(workspaceId);
  }

  isUser(userId: UserId): boolean {
    return this.userId.equals(userId);
  }

  hasRole(roleId: RoleId): boolean {
    return this.roleId.equals(roleId);
  }

  toJson(): {
    membershipId: string;
    workspaceId: string;
    userId: string;
    roleId: string;
  } {
    return {
      membershipId: this.membershipId.toString(),
      workspaceId: this.workspaceId.toString(),
      userId: this.userId.toString(),
      roleId: this.roleId.toString(),
    };
  }
}
