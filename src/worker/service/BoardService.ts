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
    return await this.db.transaction(async (tx) => {
      const createdBoard = await this.boardRepository.create(
        WorkspaceId.of(workspaceId),
        BoardName.of(name),
        tx
      );

      for (const membershipId of membershipIds) {
        const workspaceMembership =
          await this.workspaceMembershipsRepository.findById(
            MembershipId.of(membershipId)
          );
        if (!workspaceMembership) {
          throw new Error(`Membership with id ${membershipId} not found`);
        }

        const boardMembership = BoardMembership.of(
          BoardMembershipId.of(crypto.randomUUID()),
          createdBoard.boardId,
          workspaceMembership.membershipId
        );

        await this.boardMembershipsRepository.create(boardMembership, tx);
      }

      return createdBoard;
    });
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
