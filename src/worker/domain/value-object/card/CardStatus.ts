type CardStatusValue = "todo" | "in_progress" | "done";

export class CardStatus {
  private constructor(public readonly value: CardStatusValue) {}

  static of(value: CardStatusValue): CardStatus {
    return new CardStatus(value);
  }

  static todo(): CardStatus {
    return new CardStatus("todo");
  }

  static inProgress(): CardStatus {
    return new CardStatus("in_progress");
  }

  static done(): CardStatus {
    return new CardStatus("done");
  }

  isInProgress(): boolean {
    return this.value === "in_progress";
  }

  isDone(): boolean {
    return this.value === "done";
  }

  isTodo(): boolean {
    return this.value === "todo";
  }

  equals(other: CardStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  toJson(): { value: string } {
    return { value: this.value };
  }

  // 状態遷移の可否をチェック（ビジネスルール）
  canTransitionTo(newStatus: CardStatus): boolean {
    // Todo -> InProgress, Done
    if (this.isTodo()) {
      return newStatus.isInProgress() || newStatus.isDone();
    }

    // InProgress -> Done, Todo
    if (this.isInProgress()) {
      return newStatus.isDone() || newStatus.isTodo();
    }

    // Done -> InProgress（再開）
    if (this.isDone()) {
      return newStatus.isInProgress();
    }

    return false;
  }

  // 状態遷移の説明を取得
  getTransitionErrorMessage(newStatus: CardStatus): string {
    return `Cannot transition from ${this.value} to ${newStatus.value}`;
  }
}
