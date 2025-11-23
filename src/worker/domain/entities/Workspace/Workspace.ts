import { z } from "zod";
import { WorkspaceId, WorkspaceName, UserId } from "../../value-object";

export const workspaceSchema = z.object({
  workspaceId: z.custom<WorkspaceId>(
    (val) => val instanceof WorkspaceId,
    "Invalid workspace ID"
  ),
  name: z.custom<WorkspaceName>(
    (val) => val instanceof WorkspaceName,
    "Invalid workspace name"
  ),
  ownerUserId: z.custom<UserId>(
    (val) => val instanceof UserId,
    "Invalid owner user ID"
  ),
});

export class Workspace {
  private constructor(
    public readonly workspaceId: WorkspaceId,
    public readonly name: WorkspaceName,
    public readonly ownerUserId: UserId
  ) {}

  static of(
    workspaceId: WorkspaceId,
    name: WorkspaceName,
    ownerUserId: UserId
  ): Workspace {
    const validated = workspaceSchema.parse({
      workspaceId,
      name,
      ownerUserId,
    });
    return new Workspace(
      validated.workspaceId,
      validated.name,
      validated.ownerUserId
    );
  }

  static tryOf(
    workspaceId: WorkspaceId,
    name: WorkspaceName,
    ownerUserId: UserId
  ): { success: true; value: Workspace } | { success: false; error: string } {
    const result = workspaceSchema.safeParse({
      workspaceId,
      name,
      ownerUserId,
    });
    if (result.success) {
      return {
        success: true,
        value: new Workspace(
          result.data.workspaceId,
          result.data.name,
          result.data.ownerUserId
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  isOwnedBy(userId: UserId): boolean {
    return this.ownerUserId.equals(userId);
  }

  toJson(): {
    workspaceId: string;
    name: string;
    ownerUserId: string;
  } {
    return {
      workspaceId: this.workspaceId.toString(),
      name: this.name.toString(),
      ownerUserId: this.ownerUserId.toString(),
    };
  }
}
