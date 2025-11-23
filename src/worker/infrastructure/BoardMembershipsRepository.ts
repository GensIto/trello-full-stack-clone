import { DrizzleDb, DrizzleTransaction } from "../types";
import { boardMemberships } from "../db/board-schema";
import { BoardMembership } from "../domain/entities/BoardMembership";
import { and, eq } from "drizzle-orm";
import { BoardId } from "../domain/value-object";

export interface IBoardMembershipsRepository {
  create(membership: BoardMembership, tx?: DrizzleTransaction): Promise<void>;
  update(
    boardId: BoardId,
    membership: BoardMembership,
    tx?: DrizzleTransaction
  ): Promise<void>;
  delete(
    boardId: BoardId,
    membership: BoardMembership,
    tx?: DrizzleTransaction
  ): Promise<void>;
}

export class BoardMembershipsRepository implements IBoardMembershipsRepository {
  constructor(private readonly db: DrizzleDb) {}

  async create(
    membership: BoardMembership,
    tx?: DrizzleTransaction
  ): Promise<void> {
    const db = tx ?? this.db;
    await db.insert(boardMemberships).values({
      boardMembershipId: membership.boardMembershipId.toString(),
      boardId: membership.boardId.toString(),
      membershipId: membership.membershipId.toString(),
    });
  }

  async update(
    boardId: BoardId,
    membership: BoardMembership,
    tx?: DrizzleTransaction
  ): Promise<void> {
    const db = tx ?? this.db;
    await db
      .update(boardMemberships)
      .set({
        boardMembershipId: membership.boardMembershipId.value,
        boardId: boardId.value,
        membershipId: membership.membershipId.value,
      })
      .where(
        and(
          eq(boardMemberships.membershipId, membership.membershipId.value),
          eq(boardMemberships.boardId, boardId.value)
        )
      );
  }

  async delete(
    boardId: BoardId,
    membership: BoardMembership,
    tx?: DrizzleTransaction
  ): Promise<void> {
    const db = tx ?? this.db;
    await db
      .delete(boardMemberships)
      .where(
        and(
          eq(boardMemberships.boardId, boardId.value),
          eq(boardMemberships.membershipId, membership.membershipId.value)
        )
      );
  }
}
