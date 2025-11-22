import { z } from "zod";

const boardNameSchema = z
  .string()
  .min(1, "Board name is required")
  .max(100, "Board name must be 100 characters or less")
  .trim();

export class BoardName {
  private constructor(private readonly _value: string) {}

  static of(value: string): BoardName {
    const validated = boardNameSchema.parse(value);
    return new BoardName(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: BoardName } | { success: false; error: string } {
    const result = boardNameSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new BoardName(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: BoardName): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
