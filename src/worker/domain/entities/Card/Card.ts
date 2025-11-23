import {
  CardId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
  EmailAddress,
} from "../../value-object";

export class Card {
  private _id: CardId;
  private _title: CardTitle;
  private _description: CardDescription;
  private _status: CardStatus;
  private _dueDate: DueDate;
  private _assignee: EmailAddress;

  private constructor(
    id: CardId,
    title: CardTitle,
    description: CardDescription,
    status: CardStatus,
    dueDate: DueDate,
    assignee: EmailAddress
  ) {
    this._id = id;
    this._title = title;
    this._description = description;
    this._status = status;
    this._dueDate = dueDate;
    this._assignee = assignee;
  }

  static create(
    id: CardId,
    title: CardTitle,
    description: CardDescription,
    status: CardStatus,
    dueDate: DueDate,
    assignee: EmailAddress
  ): Card {
    return new Card(id, title, description, status, dueDate, assignee);
  }

  // ゲッター（外部からは読み取り専用）
  get id(): CardId {
    return this._id;
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

  get assignee(): EmailAddress {
    return this._assignee;
  }

  // ビジネスロジック：状態遷移（ビジネスルールを含む）
  changeStatus(newStatus: CardStatus): void {
    if (!this._status.canTransitionTo(newStatus)) {
      throw new Error(this._status.getTransitionErrorMessage(newStatus));
    }
    this._status = newStatus;
  }

  // ビジネスロジック：作業開始
  start(): void {
    this.changeStatus(CardStatus.inProgress());
  }

  // ビジネスロジック：完了
  complete(): void {
    this.changeStatus(CardStatus.done());
  }

  // ビジネスロジック：再開（Doneから戻す）
  reopen(): void {
    if (!this._status.isDone()) {
      throw new Error("Only completed cards can be reopened");
    }
    this._status = CardStatus.inProgress();
  }

  // ビジネスロジック：タイトル更新
  updateTitle(newTitle: CardTitle): void {
    this._title = newTitle;
  }

  // ビジネスロジック：説明更新
  updateDescription(newDescription: CardDescription): void {
    this._description = newDescription;
  }

  // ビジネスロジック：担当者変更
  assignTo(assignee: EmailAddress): void {
    this._assignee = assignee;
  }

  // ビジネスロジック：期限変更
  changeDueDate(newDueDate: DueDate): void {
    this._dueDate = newDueDate;
  }

  // ビジネスロジック：期限切れかどうか
  isOverdue(): boolean {
    return !this._status.isDone() && this._dueDate.isOverdue();
  }

  toJson() {
    return {
      id: this._id.toString(),
      title: this._title.toString(),
      description: this._description.toString(),
      status: this._status.toString(),
      dueDate: this._dueDate.toJson(),
      assignee: this._assignee.toString(),
    };
  }
}
