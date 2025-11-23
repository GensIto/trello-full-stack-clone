import { z } from "zod";
import { RoleId, RoleName } from "../../value-object";

const roleSchema = z.object({
  roleId: z.custom<RoleId>((val) => val instanceof RoleId, "Invalid role ID"),
  name: z.custom<RoleName>(
    (val) => val instanceof RoleName,
    "Invalid role name"
  ),
});

export class Role {
  private constructor(
    public readonly roleId: RoleId,
    public readonly name: RoleName
  ) {}

  static of(roleId: RoleId, name: RoleName): Role {
    const validated = roleSchema.parse({ roleId, name });
    return new Role(validated.roleId, validated.name);
  }

  static tryOf(
    roleId: RoleId,
    name: RoleName
  ): { success: true; value: Role } | { success: false; error: string } {
    const result = roleSchema.safeParse({ roleId, name });
    if (result.success) {
      return {
        success: true,
        value: new Role(result.data.roleId, result.data.name),
      };
    }
    return { success: false, error: result.error.message };
  }

  isOwner(): boolean {
    return this.name.isOwner();
  }

  isAdmin(): boolean {
    return this.name.isAdmin();
  }

  isMember(): boolean {
    return this.name.isMember();
  }

  isGuest(): boolean {
    return this.name.isGuest();
  }

  canManageWorkspace(): boolean {
    return this.name.canManageWorkspace();
  }

  canEditBoard(): boolean {
    return this.name.canEditBoard();
  }

  toJson(): {
    roleId: string;
    name: string;
  } {
    return {
      roleId: this.roleId.toString(),
      name: this.name.toString(),
    };
  }
}
