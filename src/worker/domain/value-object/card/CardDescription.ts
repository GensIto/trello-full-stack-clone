import { z } from "zod";

const cardDescriptionSchema = z.string().max(2000, "Card description is too long").default("");

export class CardDescription {
  private constructor(private readonly _value: string) {}

  static of(value: string): CardDescription {
    const validated = cardDescriptionSchema.parse(value);
    return new CardDescription(validated);
  }

  static empty(): CardDescription {
    return new CardDescription("");
  }

  static tryOf(value: string): { success: true; value: CardDescription } | { success: false; error: string } {
    const result = cardDescriptionSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CardDescription(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  isEmpty(): boolean {
    return this._value.trim() === "";
  }

  equals(other: CardDescription): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
