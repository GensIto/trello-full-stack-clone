import z from "zod";
import {
  CardId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
  MembershipId,
} from "../../value-object";

const cardSchema = z.object({
  cardId: z.custom<CardId>((val) => val instanceof CardId, "Invalid card ID"),
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
  dueDate: z.custom<DueDate>(
    (val) => val instanceof DueDate,
    "Invalid due date"
  ),
  assigneeMembershipId: z
    .custom<MembershipId>(
      (val) => val instanceof MembershipId,
      "Invalid assignee membership ID"
    )
    .nullable(),
});

export class Card {
  private constructor(
    private readonly _cardId: CardId,
    private readonly _title: CardTitle,
    private readonly _description: CardDescription,
    private readonly _status: CardStatus,
    private readonly _dueDate: DueDate,
    private readonly _assigneeMembershipId: MembershipId | null
  ) {}

  get id(): CardId {
    return this._cardId;
  }

  get title(): CardTitle {
    return this._title;
  }

  get description(): CardDescription {
    return this._description;
  }

  get status(): CardStatus {
    return this._status;
  }

  get dueDate(): DueDate {
    return this._dueDate;
  }

  get assigneeMembershipId(): MembershipId | null {
    return this._assigneeMembershipId;
  }

  static of(
    cardId: CardId,
    title: CardTitle,
    description: CardDescription,
    status: CardStatus,
    dueDate: DueDate,
    assigneeMembershipId: MembershipId | null
  ): Card {
    const validated = cardSchema.parse({
      cardId,
      title,
      description,
      status,
      dueDate,
      assigneeMembershipId,
    });
    return new Card(
      validated.cardId,
      validated.title,
      validated.description,
      validated.status,
      validated.dueDate,
      validated.assigneeMembershipId
    );
  }

  static tryOf(
    cardId: CardId,
    title: CardTitle,
    description: CardDescription,
    status: CardStatus,
    dueDate: DueDate,
    assigneeMembershipId: MembershipId | null
  ): { success: true; value: Card } | { success: false; error: string } {
    const result = cardSchema.safeParse({
      cardId,
      title,
      description,
      status,
      dueDate,
      assigneeMembershipId,
    });
    if (result.success) {
      return {
        success: true,
        value: new Card(
          result.data.cardId,
          result.data.title,
          result.data.description,
          result.data.status,
          result.data.dueDate,
          result.data.assigneeMembershipId
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  changeStatus(newStatus: CardStatus): Card {
    if (!this._status.canTransitionTo(newStatus)) {
      throw new Error(this._status.getTransitionErrorMessage(newStatus));
    }
    return new Card(
      this._cardId,
      this._title,
      this._description,
      newStatus,
      this._dueDate,
      this._assigneeMembershipId
    );
  }

  start(): Card {
    return this.changeStatus(CardStatus.inProgress());
  }

  complete(): Card {
    return this.changeStatus(CardStatus.done());
  }

  reopen(): Card {
    if (!this._status.isDone()) {
      throw new Error("Only completed cards can be reopened");
    }
    return new Card(
      this._cardId,
      this._title,
      this._description,
      CardStatus.inProgress(),
      this._dueDate,
      this._assigneeMembershipId
    );
  }

  updateTitle(newTitle: CardTitle): Card {
    return new Card(
      this._cardId,
      newTitle,
      this._description,
      this._status,
      this._dueDate,
      this._assigneeMembershipId
    );
  }

  updateDescription(newDescription: CardDescription): Card {
    return new Card(
      this._cardId,
      this._title,
      newDescription,
      this._status,
      this._dueDate,
      this._assigneeMembershipId
    );
  }

  assignTo(membershipId: MembershipId): Card {
    return new Card(
      this._cardId,
      this._title,
      this._description,
      this._status,
      this._dueDate,
      membershipId
    );
  }

  unassign(): Card {
    return new Card(
      this._cardId,
      this._title,
      this._description,
      this._status,
      this._dueDate,
      null
    );
  }

  changeDueDate(newDueDate: DueDate): Card {
    return new Card(
      this._cardId,
      this._title,
      this._description,
      this._status,
      newDueDate,
      this._assigneeMembershipId
    );
  }

  isAssigned(): boolean {
    return this._assigneeMembershipId !== null;
  }

  isOverdue(): boolean {
    return !this._status.isDone() && this._dueDate.isOverdue();
  }

  toJson(): {
    id: string;
    title: string;
    description: string;
    status: string;
    dueDate: string;
    assigneeMembershipId: string | null;
  } {
    return {
      id: this._cardId.value,
      title: this._title.value,
      description: this._description.value,
      status: this._status.value,
      dueDate: this._dueDate.toJson(),
      assigneeMembershipId: this._assigneeMembershipId?.value ?? null,
    };
  }
}
