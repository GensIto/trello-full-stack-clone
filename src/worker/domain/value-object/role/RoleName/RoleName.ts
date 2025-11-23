import { z } from "zod";

const roleNameSchema = z.enum(["owner", "admin", "member", "guest"]);

export type RoleNameValue = z.infer<typeof roleNameSchema>;

export class RoleName {
  private constructor(private readonly _value: RoleNameValue) {}

  static of(value: RoleNameValue): RoleName {
    const validated = roleNameSchema.parse(value);
    return new RoleName(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: RoleName } | { success: false; error: string } {
    const result = roleNameSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new RoleName(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  static owner(): RoleName {
    return new RoleName("owner");
  }

  static admin(): RoleName {
    return new RoleName("admin");
  }

  static member(): RoleName {
    return new RoleName("member");
  }

  static guest(): RoleName {
    return new RoleName("guest");
  }

  get value(): RoleNameValue {
    return this._value;
  }

  isOwner(): boolean {
    return this._value === "owner";
  }

  isAdmin(): boolean {
    return this._value === "admin";
  }

  isMember(): boolean {
    return this._value === "member";
  }

  isGuest(): boolean {
    return this._value === "guest";
  }

  canManageWorkspace(): boolean {
    return this.isOwner() || this.isAdmin();
  }

  canEditBoard(): boolean {
    return this.isOwner() || this.isAdmin() || this.isMember();
  }

  equals(other: RoleName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
