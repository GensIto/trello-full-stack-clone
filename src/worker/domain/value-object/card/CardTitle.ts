import { z } from "zod";

const cardTitleSchema = z
  .string()
  .min(1, "Card title cannot be empty")
  .max(200, "Card title is too long")
  .trim();

export class CardTitle {
  private constructor(private readonly _value: string) {}

  static of(value: string): CardTitle {
    const validated = cardTitleSchema.parse(value);
    return new CardTitle(validated);
  }

  static tryOf(value: string): { success: true; value: CardTitle } | { success: false; error: string } {
    const result = cardTitleSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CardTitle(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: CardTitle): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
