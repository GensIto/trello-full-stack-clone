import { z } from "zod";

const cardVersionSchema = z
  .number()
  .int()
  .positive("Card version must be positive");

export class CardVersion {
  private constructor(private readonly _value: number) {}

  static of(value: number): CardVersion {
    const validated = cardVersionSchema.parse(value);
    return new CardVersion(validated);
  }

  static tryOf(
    value: number
  ): { success: true; value: CardVersion } | { success: false; error: string } {
    const result = cardVersionSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new CardVersion(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  static initial(): CardVersion {
    return new CardVersion(1);
  }

  get value(): number {
    return this._value;
  }

  increment(): CardVersion {
    return new CardVersion(this._value + 1);
  }

  equals(other: CardVersion): boolean {
    return this._value === other._value;
  }

  isNewer(other: CardVersion): boolean {
    return this._value > other._value;
  }

  toString(): string {
    return this._value.toString();
  }
}
