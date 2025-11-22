import { z } from "zod";
import {
  CardId,
  CardVersion,
  BoardId,
  MembershipId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
} from "../value-object";

const historyIdSchema = z.string().uuid("Invalid history ID format");

export class HistoryId {
  private constructor(private readonly _value: string) {}

  static of(value: string): HistoryId {
    const validated = historyIdSchema.parse(value);
    return new HistoryId(validated);
  }

  get value(): string {
    return this._value;
  }

  equals(other: HistoryId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

const cardHistorySchema = z.object({
  historyId: z.custom<HistoryId>(
    (val) => val instanceof HistoryId,
    "Invalid history ID"
  ),
  cardId: z.custom<CardId>((val) => val instanceof CardId, "Invalid card ID"),
  version: z.custom<CardVersion>(
    (val) => val instanceof CardVersion,
    "Invalid card version"
  ),
  boardId: z.custom<BoardId>(
    (val) => val instanceof BoardId,
    "Invalid board ID"
  ),
  assigneeMembershipId: z
    .custom<MembershipId>(
      (val) => val instanceof MembershipId,
      "Invalid assignee membership ID"
    )
    .nullable(),
  actorMembershipId: z.custom<MembershipId>(
    (val) => val instanceof MembershipId,
    "Invalid actor membership ID"
  ),
  title: z.custom<CardTitle>(
    (val) => val instanceof CardTitle,
    "Invalid card title"
  ),
  description: z.custom<CardDescription>(
    (val) => val instanceof CardDescription,
    "Invalid card description"
  ),
  status: z.custom<CardStatus>(
    (val) => val instanceof CardStatus,
    "Invalid card status"
  ),
  dueDate: z
    .custom<DueDate>((val) => val instanceof DueDate, "Invalid due date")
    .nullable(),
  createdAt: z.date(),
});

export class CardHistory {
  private constructor(
    public readonly historyId: HistoryId,
    public readonly cardId: CardId,
    public readonly version: CardVersion,
    public readonly boardId: BoardId,
    public readonly assigneeMembershipId: MembershipId | null,
    public readonly actorMembershipId: MembershipId,
    public readonly title: CardTitle,
    public readonly description: CardDescription,
    public readonly status: CardStatus,
    public readonly dueDate: DueDate | null,
    public readonly createdAt: Date
  ) {}

  static of(
    historyId: HistoryId,
    cardId: CardId,
    version: CardVersion,
    boardId: BoardId,
    assigneeMembershipId: MembershipId | null,
    actorMembershipId: MembershipId,
    title: CardTitle,
    description: CardDescription,
    status: CardStatus,
    dueDate: DueDate | null,
    createdAt: Date = new Date()
  ): CardHistory {
    const validated = cardHistorySchema.parse({
      historyId,
      cardId,
      version,
      boardId,
      assigneeMembershipId,
      actorMembershipId,
      title,
      description,
      status,
      dueDate,
      createdAt,
    });
    return new CardHistory(
      validated.historyId,
      validated.cardId,
      validated.version,
      validated.boardId,
      validated.assigneeMembershipId,
      validated.actorMembershipId,
      validated.title,
      validated.description,
      validated.status,
      validated.dueDate,
      validated.createdAt
    );
  }

  belongsToCard(cardId: CardId): boolean {
    return this.cardId.equals(cardId);
  }

  wasActedByMember(membershipId: MembershipId): boolean {
    return this.actorMembershipId.equals(membershipId);
  }

  toJson(): {
    historyId: string;
    cardId: string;
    version: string;
    boardId: string;
    assigneeMembershipId: string | null;
    actorMembershipId: string;
    title: string;
    description: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
  } {
    return {
      historyId: this.historyId.toString(),
      cardId: this.cardId.toString(),
      version: this.version.toString(),
      boardId: this.boardId.toString(),
      assigneeMembershipId: this.assigneeMembershipId?.toString() ?? null,
      actorMembershipId: this.actorMembershipId.toString(),
      title: this.title.toString(),
      description: this.description.toString(),
      status: this.status.toString(),
      dueDate: this.dueDate?.toString() ?? null,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
