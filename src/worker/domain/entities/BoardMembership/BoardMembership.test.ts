import { describe, it, expect } from "vitest";
import { BoardMembership, BoardMembershipId } from "./BoardMembership";
import { BoardId, MembershipId } from "../../value-object";

describe("BoardMembershipId", () => {
  const validId = "11111111-1111-4111-8111-111111111111";

  describe("of", () => {
    it("有効なBoardMembershipIdを作成できること", () => {
      const id = BoardMembershipId.of(validId);

      expect(id.value).toBe(validId);
    });

    it("無効なUUIDでエラーをスローすること", () => {
      expect(() => BoardMembershipId.of("invalid")).toThrow();
    });
  });

  describe("equals", () => {
    it("等しいIDでtrueを返すこと", () => {
      const id1 = BoardMembershipId.of(validId);
      const id2 = BoardMembershipId.of(validId);

      expect(id1.equals(id2)).toBe(true);
    });

    it("異なるIDでfalseを返すこと", () => {
      const id1 = BoardMembershipId.of(validId);
      const id2 = BoardMembershipId.of("22222222-2222-4222-8222-222222222222");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列値を返すこと", () => {
      const id = BoardMembershipId.of(validId);

      expect(id.toString()).toBe(validId);
    });
  });
});

describe("BoardMembership", () => {
  const validBoardMembershipId = "11111111-1111-4111-8111-111111111111";
  const validBoardId = "22222222-2222-4222-8222-222222222222";
  const validMembershipId = "33333333-3333-4333-8333-333333333333";

  describe("of", () => {
    it("有効なBoardMembershipエンティティを作成できること", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      expect(membership.boardMembershipId.value).toBe(validBoardMembershipId);
      expect(membership.boardId.value).toBe(validBoardId);
      expect(membership.membershipId.value).toBe(validMembershipId);
    });

    it("無効なボードメンバーシップIDでエラーをスローすること", () => {
      expect(() =>
        BoardMembership.of(
          BoardMembershipId.of("invalid"),
          BoardId.of(validBoardId),
          MembershipId.of(validMembershipId)
        )
      ).toThrow();
    });

    it("無効なボードIDでエラーをスローすること", () => {
      expect(() =>
        BoardMembership.of(
          BoardMembershipId.of(validBoardMembershipId),
          BoardId.of("invalid"),
          MembershipId.of(validMembershipId)
        )
      ).toThrow();
    });

    it("無効なメンバーシップIDでエラーをスローすること", () => {
      expect(() =>
        BoardMembership.of(
          BoardMembershipId.of(validBoardMembershipId),
          BoardId.of(validBoardId),
          MembershipId.of("invalid")
        )
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なメンバーシップで成功を返すこと", () => {
      const result = BoardMembership.tryOf(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.boardMembershipId.value).toBe(
          validBoardMembershipId
        );
        expect(result.value.boardId.value).toBe(validBoardId);
        expect(result.value.membershipId.value).toBe(validMembershipId);
      }
    });

    it("無効なメンバーシップでエラーを返すこと", () => {
      expect(() => {
        BoardMembershipId.of("invalid");
      }).toThrow();
    });
  });

  describe("belongsToBoard", () => {
    it("メンバーシップがボードに属している場合にtrueを返すこと", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      expect(membership.belongsToBoard(BoardId.of(validBoardId))).toBe(true);
    });

    it("メンバーシップがボードに属していない場合にfalseを返すこと", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      const differentBoardId = "44444444-4444-4444-8444-444444444444";
      expect(membership.belongsToBoard(BoardId.of(differentBoardId))).toBe(
        false
      );
    });
  });

  describe("isMember", () => {
    it("メンバーである場合にtrueを返すこと", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      expect(membership.isMember(MembershipId.of(validMembershipId))).toBe(
        true
      );
    });

    it("メンバーでない場合にfalseを返すこと", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      const differentMembershipId = "44444444-4444-4444-8444-444444444444";
      expect(membership.isMember(MembershipId.of(differentMembershipId))).toBe(
        false
      );
    });
  });

  describe("toJson", () => {
    it("メンバーシップをJSONに変換できること", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      const json = membership.toJson();

      expect(json).toEqual({
        boardMembershipId: validBoardMembershipId,
        boardId: validBoardId,
        membershipId: validMembershipId,
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      const json = membership.toJson();

      expect(typeof json.boardMembershipId).toBe("string");
      expect(typeof json.boardId).toBe("string");
      expect(typeof json.membershipId).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const membership = BoardMembership.of(
        BoardMembershipId.of(validBoardMembershipId),
        BoardId.of(validBoardId),
        MembershipId.of(validMembershipId)
      );

      const originalBoardMembershipId = membership.boardMembershipId;
      const originalBoardId = membership.boardId;
      const originalMembershipId = membership.membershipId;

      expect(membership.boardMembershipId).toBe(originalBoardMembershipId);
      expect(membership.boardId).toBe(originalBoardId);
      expect(membership.membershipId).toBe(originalMembershipId);
    });
  });
});
