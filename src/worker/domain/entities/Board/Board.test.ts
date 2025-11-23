import { describe, it, expect } from "vitest";
import { Board } from "./Board";
import { BoardId, WorkspaceId, BoardName } from "../../value-object";

describe("Board", () => {
  const validBoardId = "11111111-1111-4111-8111-111111111111";
  const validWorkspaceId = "22222222-2222-4222-8222-222222222222";
  const validBoardName = "Test Board";

  describe("of", () => {
    it("有効なBoardエンティティを作成できること", () => {
      const board = Board.of(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      expect(board.boardId.value).toBe(validBoardId);
      expect(board.workspaceId.value).toBe(validWorkspaceId);
      expect(board.name.value).toBe(validBoardName);
    });

    it("無効なボードIDでエラーをスローすること", () => {
      expect(() =>
        Board.of(
          BoardId.of("invalid"),
          WorkspaceId.of(validWorkspaceId),
          BoardName.of(validBoardName)
        )
      ).toThrow();
    });

    it("無効なワークスペースIDでエラーをスローすること", () => {
      expect(() =>
        Board.of(
          BoardId.of(validBoardId),
          WorkspaceId.of("invalid"),
          BoardName.of(validBoardName)
        )
      ).toThrow();
    });

    it("無効なボード名でエラーをスローすること", () => {
      expect(() =>
        Board.of(
          BoardId.of(validBoardId),
          WorkspaceId.of(validWorkspaceId),
          BoardName.of("")
        )
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なボードで成功を返すこと", () => {
      const result = Board.tryOf(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.boardId.value).toBe(validBoardId);
        expect(result.value.workspaceId.value).toBe(validWorkspaceId);
        expect(result.value.name.value).toBe(validBoardName);
      }
    });

    it("無効なボードでエラーを返すこと", () => {
      expect(() => {
        BoardId.of("invalid");
      }).toThrow();
    });
  });

  describe("belongsToWorkspace", () => {
    it("ボードがワークスペースに属している場合にtrueを返すこと", () => {
      const board = Board.of(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      expect(board.belongsToWorkspace(WorkspaceId.of(validWorkspaceId))).toBe(
        true
      );
    });

    it("ボードがワークスペースに属していない場合にfalseを返すこと", () => {
      const board = Board.of(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      const differentWorkspaceId = "33333333-3333-4333-8333-333333333333";
      expect(
        board.belongsToWorkspace(WorkspaceId.of(differentWorkspaceId))
      ).toBe(false);
    });
  });

  describe("toJson", () => {
    it("ボードをJSONに変換できること", () => {
      const board = Board.of(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      const json = board.toJson();

      expect(json).toEqual({
        boardId: validBoardId,
        workspaceId: validWorkspaceId,
        name: validBoardName,
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const board = Board.of(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      const json = board.toJson();

      expect(typeof json.boardId).toBe("string");
      expect(typeof json.workspaceId).toBe("string");
      expect(typeof json.name).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const board = Board.of(
        BoardId.of(validBoardId),
        WorkspaceId.of(validWorkspaceId),
        BoardName.of(validBoardName)
      );

      const originalBoardId = board.boardId;
      const originalWorkspaceId = board.workspaceId;
      const originalName = board.name;

      expect(board.boardId).toBe(originalBoardId);
      expect(board.workspaceId).toBe(originalWorkspaceId);
      expect(board.name).toBe(originalName);
    });
  });
});
