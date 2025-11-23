import { z } from "zod";

const dueDateSchema = z.date({ message: "Due date must be a valid date" });

export class DueDate {
  private constructor(private readonly _value: Date) {}

  static of(value: Date): DueDate {
    const validated = dueDateSchema.parse(value);
    return new DueDate(new Date(validated));
  }

  static ofFuture(value: Date): DueDate {
    const validated = dueDateSchema.parse(value);
    if (validated <= new Date()) {
      throw new Error("Due date must be in the future");
    }
    return new DueDate(new Date(validated));
  }

  static tryOf(value: Date): { success: true; value: DueDate } | { success: false; error: string } {
    const result = dueDateSchema.safeParse(value);
    if (result.success) {
      return { success: true, value: new DueDate(new Date(result.data)) };
    }
    return { success: false, error: result.error.message };
  }

  get value(): Date {
    return new Date(this._value); // 防御的コピー
  }

  isOverdue(): boolean {
    return this._value < new Date();
  }

  isSoon(daysThreshold: number = 3): boolean {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);
    return this._value <= threshold && !this.isOverdue();
  }

  daysUntilDue(): number {
    const now = new Date();
    const diff = this._value.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  equals(other: DueDate): boolean {
    return this._value.getTime() === other._value.getTime();
  }

  toString(): string {
    return this._value.toISOString();
  }

  toJson(): string {
    return this._value.toISOString();
  }
}
