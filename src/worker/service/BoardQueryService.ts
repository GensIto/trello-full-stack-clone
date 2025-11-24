import { eq } from "drizzle-orm";
import { boards, boardMemberships } from "../db/board-schema";
import { workspaceMemberships } from "../db/workspace-schema";
import { users } from "../db/auth-schema";
import { Board, User } from "../domain/entities";
import {
  BoardId,
  WorkspaceId,
  UserId,
  UserName,
  EmailAddress,
  BoardName,
  MembershipId,
} from "../domain/value-object";
import { DrizzleDb } from "../types";

export interface BoardMember {
  user: User;
  membershipId: MembershipId;
}

export interface BoardWithMembers {
  board: Board;
  members: BoardMember[];
}

export interface IBoardQueryService {
  getBoardWithMembers(
    workspaceId: WorkspaceId,
    boardId: BoardId
  ): Promise<BoardWithMembers>;
}

export class BoardQueryService implements IBoardQueryService {
  constructor(private readonly db: DrizzleDb) {}

  async getBoardWithMembers(
    workspaceId: WorkspaceId,
    boardId: BoardId
  ): Promise<BoardWithMembers> {
    const board = await this.db
      .select()
      .from(boards)
      .where(eq(boards.boardId, boardId.toString()))
      .get();

    if (!board) {
      throw new Error(`Board with id ${boardId.toString()} not found`);
    }

    if (board.workspaceId !== workspaceId.toString()) {
      throw new Error(
        `Board ${boardId.toString()} does not belong to workspace ${workspaceId.toString()}`
      );
    }

    const membersData = await this.db
      .select({
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userImage: users.image,
        userCreatedAt: users.createdAt,
        userUpdatedAt: users.updatedAt,
        membershipId: workspaceMemberships.membershipId,
      })
      .from(boardMemberships)
      .innerJoin(
        workspaceMemberships,
        eq(boardMemberships.membershipId, workspaceMemberships.membershipId)
      )
      .innerJoin(users, eq(workspaceMemberships.userId, users.id))
      .where(eq(boardMemberships.boardId, boardId.toString()))
      .all();

    const members = membersData.map((data) => ({
      user: User.of(
        UserId.of(data.userId),
        UserName.of(data.userName),
        EmailAddress.of(data.userEmail),
        data.userImage,
        data.userCreatedAt,
        data.userUpdatedAt
      ),
      membershipId: MembershipId.of(data.membershipId),
    }));

    return {
      board: Board.of(
        BoardId.of(board.boardId),
        WorkspaceId.of(board.workspaceId),
        BoardName.of(board.name)
      ),
      members,
    };
  }
}
