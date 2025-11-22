import z from "zod";

const membershipStatusSchema = z.enum(["invited", "joined"]);

export type MembershipStatusValue = z.infer<typeof membershipStatusSchema>;

export class MembershipStatus {
  private constructor(private readonly _value: MembershipStatusValue) {}

  static of(value: MembershipStatusValue): MembershipStatus {
    const validated = membershipStatusSchema.parse(value);
    return new MembershipStatus(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: MembershipStatus }
    | { success: false; error: string } {
    const result = membershipStatusSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new MembershipStatus(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): MembershipStatusValue {
    return this._value;
  }

  equals(other: MembershipStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
