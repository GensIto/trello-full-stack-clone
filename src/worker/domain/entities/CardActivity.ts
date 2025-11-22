import { z } from "zod";

import { HistoryId } from "./CardHistory";
import { CardId, MembershipId } from "../value-object";

const activityIdSchema = z.uuid("Invalid activity ID format");

export class ActivityId {
  private constructor(private readonly _value: string) {}

  static of(value: string): ActivityId {
    const validated = activityIdSchema.parse(value);
    return new ActivityId(validated);
  }

  get value(): string {
    return this._value;
  }

  equals(other: ActivityId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

const cardActivitySchema = z.object({
  activityId: z.custom<ActivityId>(
    (val) => val instanceof ActivityId,
    "Invalid activity ID"
  ),
  cardId: z.custom<CardId>((val) => val instanceof CardId, "Invalid card ID"),
  historyId: z.custom<HistoryId>(
    (val) => val instanceof HistoryId,
    "Invalid history ID"
  ),
  actorMembershipId: z.custom<MembershipId>(
    (val) => val instanceof MembershipId,
    "Invalid actor membership ID"
  ),
  action: z.string().min(1, "Action is required"),
  createdAt: z.date(),
});

export class CardActivity {
  private constructor(
    public readonly activityId: ActivityId,
    public readonly cardId: CardId,
    public readonly historyId: HistoryId,
    public readonly actorMembershipId: MembershipId,
    public readonly action: string,
    public readonly createdAt: Date
  ) {}

  static of(
    activityId: ActivityId,
    cardId: CardId,
    historyId: HistoryId,
    actorMembershipId: MembershipId,
    action: string,
    createdAt: Date = new Date()
  ): CardActivity {
    const validated = cardActivitySchema.parse({
      activityId,
      cardId,
      historyId,
      actorMembershipId,
      action,
      createdAt,
    });
    return new CardActivity(
      validated.activityId,
      validated.cardId,
      validated.historyId,
      validated.actorMembershipId,
      validated.action,
      validated.createdAt
    );
  }

  static tryOf(
    activityId: ActivityId,
    cardId: CardId,
    historyId: HistoryId,
    actorMembershipId: MembershipId,
    action: string,
    createdAt: Date = new Date()
  ):
    | { success: true; value: CardActivity }
    | { success: false; error: string } {
    const result = cardActivitySchema.safeParse({
      activityId,
      cardId,
      historyId,
      actorMembershipId,
      action,
      createdAt,
    });
    if (result.success) {
      return {
        success: true,
        value: new CardActivity(
          result.data.activityId,
          result.data.cardId,
          result.data.historyId,
          result.data.actorMembershipId,
          result.data.action,
          result.data.createdAt
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  belongsToCard(cardId: CardId): boolean {
    return this.cardId.equals(cardId);
  }

  wasPerformedByMember(membershipId: MembershipId): boolean {
    return this.actorMembershipId.equals(membershipId);
  }

  toJson(): {
    activityId: string;
    cardId: string;
    historyId: string;
    actorMembershipId: string;
    action: string;
    createdAt: string;
  } {
    return {
      activityId: this.activityId.toString(),
      cardId: this.cardId.toString(),
      historyId: this.historyId.toString(),
      actorMembershipId: this.actorMembershipId.toString(),
      action: this.action,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
