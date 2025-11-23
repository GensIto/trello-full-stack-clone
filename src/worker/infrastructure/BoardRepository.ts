import { eq, and } from "drizzle-orm";
import { boards } from "../db/board-schema";
import { Board } from "../domain/entities";
import { BoardId, BoardName, WorkspaceId } from "../domain/value-object";
import { DrizzleDb } from "../types";

export interface IBoardRepository {
  findById(workspaceId: WorkspaceId, boardId: BoardId): Promise<Board>;
  findByWorkspaceId(workspaceId: WorkspaceId): Promise<Board[]>;
  create(workspaceId: WorkspaceId, name: BoardName): Promise<Board>;
  update(
    workspaceId: WorkspaceId,
    boardId: BoardId,
    name: BoardName
  ): Promise<Board>;
  delete(workspaceId: WorkspaceId, boardId: BoardId): Promise<void>;
}

export class BoardRepository implements IBoardRepository {
  public constructor(private readonly db: DrizzleDb) {}

  async findById(workspaceId: WorkspaceId, boardId: BoardId): Promise<Board> {
    const board = await this.db
      .select()
      .from(boards)
      .where(
        and(
          eq(boards.boardId, boardId.toString()),
          eq(boards.workspaceId, workspaceId.toString())
        )
      )
      .get();
    if (!board) {
      throw new Error(`Board with id ${boardId.toString()} not found`);
    }
    return Board.of(
      BoardId.of(board.boardId),
      WorkspaceId.of(board.workspaceId),
      BoardName.of(board.name)
    );
  }

  async findByWorkspaceId(workspaceId: WorkspaceId): Promise<Board[]> {
    const allBoards = await this.db
      .select()
      .from(boards)
      .where(eq(boards.workspaceId, workspaceId.toString()))
      .all();

    return allBoards.map((board) =>
      Board.of(
        BoardId.of(board.boardId),
        WorkspaceId.of(board.workspaceId),
        BoardName.of(board.name)
      )
    );
  }

  async create(workspaceId: WorkspaceId, name: BoardName): Promise<Board> {
    const result = await this.db
      .insert(boards)
      .values({
        boardId: crypto.randomUUID(),
        workspaceId: workspaceId.toString(),
        name: name.toString(),
      })
      .returning()
      .get();
    if (!result) {
      throw new Error(`Failed to create board`);
    }
    return Board.of(
      BoardId.of(result.boardId),
      WorkspaceId.of(result.workspaceId),
      BoardName.of(result.name)
    );
  }

  async update(
    workspaceId: WorkspaceId,
    boardId: BoardId,
    name: BoardName
  ): Promise<Board> {
    const result = await this.db
      .update(boards)
      .set({ name: name.toString(), workspaceId: workspaceId.toString() })
      .where(
        and(
          eq(boards.boardId, boardId.toString()),
          eq(boards.workspaceId, workspaceId.toString())
        )
      )
      .returning()
      .get();
    if (!result) {
      throw new Error(`Failed to update board`);
    }
    return Board.of(
      BoardId.of(result.boardId),
      WorkspaceId.of(result.workspaceId),
      BoardName.of(result.name)
    );
  }

  async delete(workspaceId: WorkspaceId, boardId: BoardId): Promise<void> {
    await this.db
      .delete(boards)
      .where(
        and(
          eq(boards.boardId, boardId.toString()),
          eq(boards.workspaceId, workspaceId.toString())
        )
      );
  }
}
