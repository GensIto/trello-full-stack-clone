import { z } from "zod";

const workspaceIdSchema = z.string().uuid("Invalid workspace ID format");

export class WorkspaceId {
  private constructor(private readonly _value: string) {}

  static of(value: string): WorkspaceId {
    const validated = workspaceIdSchema.parse(value);
    return new WorkspaceId(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: WorkspaceId }
    | { success: false; error: string } {
    const result = workspaceIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new WorkspaceId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: WorkspaceId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
