import { z } from "zod";

const workspaceNameSchema = z
  .string()
  .min(1, "Workspace name is required")
  .max(100, "Workspace name must be 100 characters or less")
  .trim();

export class WorkspaceName {
  private constructor(private readonly _value: string) {}

  static of(value: string): WorkspaceName {
    const validated = workspaceNameSchema.parse(value);
    return new WorkspaceName(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: WorkspaceName }
    | { success: false; error: string } {
    const result = workspaceNameSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new WorkspaceName(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: WorkspaceName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
