import { Board } from "../domain/entities";
import {
  BoardId,
  BoardName,
  WorkspaceId,
  UserId,
  RoleId,
  MembershipId,
} from "../domain/value-object";
import { IBoardRepository } from "../infrastructure/BoardRepository";
import { IWorkspaceMembershipsRepository } from "../infrastructure/WorkspaceMembershipsRepository";
import { DrizzleDb } from "../types";
import {
  BoardMembership,
  BoardMembershipId,
} from "../domain/entities/BoardMembership";
import { IBoardMembershipsRepository } from "../infrastructure/BoardMembershipsRepository";
import { boards, boardMemberships } from "../db/board-schema";

export interface IBoardService {
  findBoardById(workspaceId: string, boardId: string): Promise<Board>;
  findBoardsByWorkspaceId(workspaceId: string): Promise<Board[]>;
  createBoard(
    workspaceId: string,
    name: string,
    membershipIds: string[]
  ): Promise<Board>;
  updateBoard(
    workspaceId: string,
    boardId: string,
    name: string
  ): Promise<Board>;
  deleteBoard(workspaceId: string, boardId: string): Promise<void>;
  removeMemberFromBoard(
    boardId: string,
    membership: BoardMembership
  ): Promise<void>;
  addMemberToBoard(boardId: string, membership: BoardMembership): Promise<void>;
  canManageBoard(workspaceId: string, userId: string): Promise<boolean>;
}
export class BoardService implements IBoardService {
  public constructor(
    private readonly boardRepository: IBoardRepository,
    private readonly workspaceMembershipsRepository: IWorkspaceMembershipsRepository,
    private readonly boardMembershipsRepository: IBoardMembershipsRepository,
    private readonly db: DrizzleDb
  ) {}

  async findBoardById(workspaceId: string, boardId: string): Promise<Board> {
    return this.boardRepository.findById(
      WorkspaceId.of(workspaceId),
      BoardId.of(boardId)
    );
  }

  async findBoardsByWorkspaceId(workspaceId: string): Promise<Board[]> {
    return this.boardRepository.findByWorkspaceId(WorkspaceId.of(workspaceId));
  }

  async createBoard(
    workspaceId: string,
    name: string,
    membershipIds: string[]
  ): Promise<Board> {
    // メンバーシップの存在確認
    const workspaceMemberships = await Promise.all(
      membershipIds.map(async (membershipId) => {
        const membership = await this.workspaceMembershipsRepository.findById(
          MembershipId.of(membershipId)
        );
        if (!membership) {
          throw new Error(`Membership with id ${membershipId} not found`);
        }
        return membership;
      })
    );

    const boardId = BoardId.of(crypto.randomUUID());
    const boardName = BoardName.of(name);
    const workspaceIdObj = WorkspaceId.of(workspaceId);

    // ボードメンバーシップを作成
    const boardMembershipValues = workspaceMemberships.map((membership) => {
      const boardMembership = BoardMembership.of(
        BoardMembershipId.of(crypto.randomUUID()),
        boardId,
        membership.membershipId
      );
      return {
        boardMembershipId: boardMembership.boardMembershipId.toString(),
        boardId: boardMembership.boardId.toString(),
        membershipId: boardMembership.membershipId.toString(),
      };
    });

    // D1のbatch()を使用して複数のクエリを一度に実行
    const boardInsertQuery = this.db
      .insert(boards)
      .values({
        boardId: boardId.toString(),
        workspaceId: workspaceIdObj.toString(),
        name: boardName.toString(),
      })
      .returning();

    const boardMembershipQueries = boardMembershipValues.map((values) =>
      this.db.insert(boardMemberships).values(values)
    );

    const results = await this.db.batch([
      boardInsertQuery,
      ...boardMembershipQueries,
    ]);

    const createdBoardResult = results[0];
    if (!createdBoardResult || createdBoardResult.length === 0) {
      throw new Error("Failed to create board");
    }

    const createdBoardData = createdBoardResult[0];
    return Board.of(
      BoardId.of(createdBoardData.boardId),
      WorkspaceId.of(createdBoardData.workspaceId),
      BoardName.of(createdBoardData.name)
    );
  }

  async updateBoard(
    workspaceId: string,
    boardId: string,
    name: string
  ): Promise<Board> {
    return this.boardRepository.update(
      WorkspaceId.of(workspaceId),
      BoardId.of(boardId),
      BoardName.of(name)
    );
  }

  async deleteBoard(workspaceId: string, boardId: string): Promise<void> {
    return this.boardRepository.delete(
      WorkspaceId.of(workspaceId),
      BoardId.of(boardId)
    );
  }

  async removeMemberFromBoard(
    boardId: string,
    membership: BoardMembership
  ): Promise<void> {
    return this.boardMembershipsRepository.delete(
      BoardId.of(boardId),
      membership
    );
  }

  async addMemberToBoard(
    boardId: string,
    membership: BoardMembership
  ): Promise<void> {
    return this.boardMembershipsRepository.update(
      BoardId.of(boardId),
      membership
    );
  }

  async canManageBoard(workspaceId: string, userId: string): Promise<boolean> {
    const membership =
      await this.workspaceMembershipsRepository.findByWorkspaceIdAndUserId(
        WorkspaceId.of(workspaceId),
        UserId.of(userId)
      );

    if (!membership) {
      return false;
    }

    return (
      membership.roleId.equals(RoleId.OWNER) ||
      membership.roleId.equals(RoleId.ADMIN)
    );
  }
}
