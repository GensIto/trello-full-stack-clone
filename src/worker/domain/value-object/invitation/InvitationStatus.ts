import { z } from "zod";

const invitationStatusSchema = z.enum(["pending", "accepted", "rejected"]);

export type InvitationStatusType = z.infer<typeof invitationStatusSchema>;

export class InvitationStatus {
  private constructor(private readonly _value: InvitationStatusType) {}

  static of(value: InvitationStatusType): InvitationStatus {
    const validated = invitationStatusSchema.parse(value);
    return new InvitationStatus(validated);
  }

  static tryOf(
    value: string
  ):
    | { success: true; value: InvitationStatus }
    | { success: false; error: string } {
    const result = invitationStatusSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new InvitationStatus(result.data) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): InvitationStatusType {
    return this._value;
  }

  equals(other: InvitationStatus): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }

  isPending(): boolean {
    return this._value === "pending";
  }

  isAccepted(): boolean {
    return this._value === "accepted";
  }

  isRejected(): boolean {
    return this._value === "rejected";
  }
}
