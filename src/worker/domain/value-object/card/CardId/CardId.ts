import { z } from "zod";

const cardIdSchema = z.string().min(1, "Card ID cannot be empty").max(100, "Card ID is too long");

export class CardId {
  private constructor(private readonly _value: string) {}

  static of(value: string): CardId {
    const validated = cardIdSchema.parse(value);
    return new CardId(validated);
  }

  static tryOf(value: string): { success: true; value: CardId } | { success: false; error: string } {
    const result = cardIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CardId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CardId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
