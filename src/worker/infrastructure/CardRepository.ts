import { eq, and } from "drizzle-orm";
import { cards } from "../db/card-schema";
import { Card } from "../domain/entities";
import {
  CardId,
  BoardId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
  MembershipId,
} from "../domain/value-object";
import { DrizzleDb } from "../types";

export interface ICardRepository {
  findByCardId(boardId: BoardId, cardId: CardId): Promise<Card | null>;
  findByBoardId(boardId: BoardId): Promise<Card[]>;
  create(boardId: BoardId, card: Card): Promise<Card>;
  update(boardId: BoardId, card: Card): Promise<Card>;
  delete(boardId: BoardId, cardId: CardId): Promise<void>;
}

export class CardRepository implements ICardRepository {
  constructor(private readonly db: DrizzleDb) {}

  private toEntity(row: typeof cards.$inferSelect): Card {
    return Card.of(
      CardId.of(row.cardId),
      CardTitle.of(row.title),
      CardDescription.of(row.description ?? ""),
      CardStatus.of(row.status),
      DueDate.of(row.dueDate ? new Date(row.dueDate) : new Date(Date.now())),
      row.assigneeMembershipId
        ? MembershipId.of(row.assigneeMembershipId)
        : null
    );
  }

  async findByCardId(boardId: BoardId, cardId: CardId): Promise<Card | null> {
    const result = await this.db
      .select()
      .from(cards)
      .where(
        and(eq(cards.boardId, boardId.value), eq(cards.cardId, cardId.value))
      )
      .get();

    if (!result) {
      return null;
    }
    return this.toEntity(result);
  }

  async findByBoardId(boardId: BoardId): Promise<Card[]> {
    const results = await this.db
      .select()
      .from(cards)
      .where(eq(cards.boardId, boardId.value))
      .all();

    return results.map((row) => this.toEntity(row));
  }

  async create(boardId: BoardId, card: Card): Promise<Card> {
    const result = await this.db
      .insert(cards)
      .values({
        cardId: card.id.value,
        boardId: boardId.value,
        assigneeMembershipId: card.assigneeMembershipId?.value ?? null,
        title: card.title.value,
        description: card.description.value,
        status: card.status.value,
        dueDate: card.dueDate.value,
      })
      .returning()
      .get();

    if (!result) {
      throw new Error("Failed to create card");
    }

    return this.toEntity(result);
  }

  async update(boardId: BoardId, card: Card): Promise<Card> {
    const result = await this.db
      .update(cards)
      .set({
        assigneeMembershipId: card.assigneeMembershipId?.value ?? null,
        title: card.title.value,
        description: card.description.value,
        status: card.status.value,
        dueDate: card.dueDate.value,
        updatedAt: new Date(),
      })
      .where(
        and(eq(cards.boardId, boardId.value), eq(cards.cardId, card.id.value))
      )
      .returning()
      .get();

    if (!result) {
      throw new Error("Failed to update card");
    }

    return this.toEntity(result);
  }

  async delete(boardId: BoardId, cardId: CardId): Promise<void> {
    const result = await this.db
      .delete(cards)
      .where(
        and(eq(cards.boardId, boardId.value), eq(cards.cardId, cardId.value))
      )
      .returning();

    if (result.length === 0) {
      throw new Error(`Card not found: ${cardId.value}`);
    }
  }
}
