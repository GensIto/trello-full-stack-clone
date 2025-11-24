import { eq } from "drizzle-orm";
import { cards } from "../db/card-schema";
import { workspaceMemberships } from "../db/workspace-schema";
import { users } from "../db/auth-schema";
import { Card, User } from "../domain/entities";
import {
  BoardId,
  CardId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
  MembershipId,
  UserId,
  UserName,
  EmailAddress,
} from "../domain/value-object";
import { DrizzleDb } from "../types";

export interface CardWithAssignee {
  card: Card;
  assignee: User | null;
}

export class CardQueryService {
  constructor(private readonly db: DrizzleDb) {}

  async getCardsWithAssignees(boardId: BoardId): Promise<CardWithAssignee[]> {
    const rows = await this.db
      .select({
        card: cards,
        assignee: users,
      })
      .from(cards)
      .leftJoin(
        workspaceMemberships,
        eq(cards.assigneeMembershipId, workspaceMemberships.membershipId)
      )
      .leftJoin(users, eq(workspaceMemberships.userId, users.id))
      .where(eq(cards.boardId, boardId.toString()))
      .all();

    return rows.map(({ card, assignee }) => {
      const cardEntity = Card.of(
        CardId.of(card.cardId),
        CardTitle.of(card.title),
        CardDescription.of(card.description ?? ""),
        CardStatus.of(card.status),
        DueDate.of(card.dueDate ? new Date(card.dueDate) : new Date()), // Fallback to now if null, though controller enforces it
        card.assigneeMembershipId
          ? MembershipId.of(card.assigneeMembershipId)
          : null
      );

      let assigneeUser: User | null = null;
      if (assignee) {
        assigneeUser = User.of(
          UserId.of(assignee.id),
          UserName.of(assignee.name),
          EmailAddress.of(assignee.email),
          assignee.image,
          assignee.createdAt,
          assignee.updatedAt
        );
      }

      return {
        card: cardEntity,
        assignee: assigneeUser,
      };
    });
  }
}
