import { z } from "zod";

const boardIdSchema = z.string().uuid("Invalid board ID format");

export class BoardId {
  private constructor(private readonly _value: string) {}

  static of(value: string): BoardId {
    const validated = boardIdSchema.parse(value);
    return new BoardId(validated);
  }

  static tryOf(
    value: string
  ): { success: true; value: BoardId } | { success: false; error: string } {
    const result = boardIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new BoardId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: BoardId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
