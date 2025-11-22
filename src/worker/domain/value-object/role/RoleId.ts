import { z } from "zod";

const roleIdSchema = z.number().int().positive("Role ID must be positive");

export class RoleId {
  private constructor(private readonly _value: number) {}

  static of(value: number): RoleId {
    const validated = roleIdSchema.parse(value);
    return new RoleId(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: RoleId } | { success: false; error: string } {
    const result = roleIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new RoleId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): number {
    return this._value;
  }

  equals(other: RoleId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
