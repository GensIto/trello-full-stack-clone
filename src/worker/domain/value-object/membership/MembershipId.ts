import { z } from "zod";

const membershipIdSchema = z.string().uuid("Invalid membership ID format");

export class MembershipId {
  private constructor(private readonly _value: string) {}

  static of(value: string): MembershipId {
    const validated = membershipIdSchema.parse(value);
    return new MembershipId(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: MembershipId }
    | { success: false; error: string } {
    const result = membershipIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new MembershipId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: MembershipId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
