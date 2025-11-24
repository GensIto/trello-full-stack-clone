import { BoardMembership } from "../domain/entities";
import { BoardId } from "../domain/value-object";
import { IBoardMembershipsRepository } from "../infrastructure/BoardMembershipsRepository";

export interface IBoardMembershipsService {
  addMemberToBoard(
    boardId: string,
    membership: BoardMembership
  ): Promise<void>;
  removeMemberFromBoard(
    boardId: string,
    membership: BoardMembership
  ): Promise<void>;
}

export class BoardMembershipsService implements IBoardMembershipsService {
  constructor(
    private readonly boardMembershipsRepository: IBoardMembershipsRepository
  ) {}

  async addMemberToBoard(
    boardId: string,
    membership: BoardMembership
  ): Promise<void> {
    return this.boardMembershipsRepository.create(
      BoardId.of(boardId),
      membership
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
}
