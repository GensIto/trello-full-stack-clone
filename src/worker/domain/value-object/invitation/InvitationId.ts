import { z } from "zod";

const invitationIdSchema = z.string().uuid("Invalid invitation ID format");

export class InvitationId {
  private constructor(private readonly _value: string) {}

  static of(value: string): InvitationId {
    const validated = invitationIdSchema.parse(value);
    return new InvitationId(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: InvitationId }
    | { success: false; error: string } {
    const result = invitationIdSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new InvitationId(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): string {
    return this._value;
  }

  equals(other: InvitationId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}
