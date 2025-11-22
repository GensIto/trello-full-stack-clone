import { z } from "zod";
import { BoardId, WorkspaceId, BoardName } from "../value-object";

const boardSchema = z.object({
  boardId: z.custom<BoardId>(
    (val) => val instanceof BoardId,
    "Invalid board ID"
  ),
  workspaceId: z.custom<WorkspaceId>(
    (val) => val instanceof WorkspaceId,
    "Invalid workspace ID"
  ),
  name: z.custom<BoardName>(
    (val) => val instanceof BoardName,
    "Invalid board name"
  ),
});

export class Board {
  private constructor(
    public readonly boardId: BoardId,
    public readonly workspaceId: WorkspaceId,
    public readonly name: BoardName
  ) {}

  static of(
    boardId: BoardId,
    workspaceId: WorkspaceId,
    name: BoardName
  ): Board {
    const validated = boardSchema.parse({
      boardId,
      workspaceId,
      name,
    });
    return new Board(validated.boardId, validated.workspaceId, validated.name);
  }

  static tryOf(
    boardId: BoardId,
    workspaceId: WorkspaceId,
    name: BoardName
  ): { success: true; value: Board } | { success: false; error: string } {
    const result = boardSchema.safeParse({
      boardId,
      workspaceId,
      name,
    });
    if (result.success) {
      return {
        success: true,
        value: new Board(
          result.data.boardId,
          result.data.workspaceId,
          result.data.name
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  belongsToWorkspace(workspaceId: WorkspaceId): boolean {
    return this.workspaceId.equals(workspaceId);
  }

  toJson(): {
    boardId: string;
    workspaceId: string;
    name: string;
  } {
    return {
      boardId: this.boardId.toString(),
      workspaceId: this.workspaceId.toString(),
      name: this.name.toString(),
    };
  }
}
