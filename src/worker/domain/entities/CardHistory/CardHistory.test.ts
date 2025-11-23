import { describe, it, expect } from "vitest";
import { CardHistory, HistoryId } from "./CardHistory";
import {
  CardId,
  CardVersion,
  BoardId,
  MembershipId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
} from "../../value-object";

describe("HistoryId", () => {
  const validId = "11111111-1111-4111-8111-111111111111";

  describe("of", () => {
    it("有効なHistoryIdを作成できること", () => {
      const id = HistoryId.of(validId);

      expect(id.value).toBe(validId);
    });

    it("無効なUUIDでエラーをスローすること", () => {
      expect(() => HistoryId.of("invalid")).toThrow();
    });
  });

  describe("equals", () => {
    it("等しいIDでtrueを返すこと", () => {
      const id1 = HistoryId.of(validId);
      const id2 = HistoryId.of(validId);

      expect(id1.equals(id2)).toBe(true);
    });

    it("異なるIDでfalseを返すこと", () => {
      const id1 = HistoryId.of(validId);
      const id2 = HistoryId.of("22222222-2222-4222-8222-222222222222");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列値を返すこと", () => {
      const id = HistoryId.of(validId);

      expect(id.toString()).toBe(validId);
    });
  });
});

describe("CardHistory", () => {
  const validHistoryId = "11111111-1111-4111-8111-111111111111";
  const validCardId = CardId.of("22222222-2222-4222-8222-222222222222");
  const validVersion = CardVersion.of(1);
  const validBoardId = BoardId.of("33333333-3333-4333-8333-333333333333");
  const validAssigneeMembershipId = MembershipId.of(
    "44444444-4444-4444-8444-444444444444"
  );
  const validActorMembershipId = MembershipId.of(
    "55555555-5555-4555-8555-555555555555"
  );
  const validTitle = CardTitle.of("Test Card");
  const validDescription = CardDescription.of("Test Description");
  const validStatus = CardStatus.todo();
  const validDueDate = DueDate.of(new Date("2025-12-31T23:59:59Z"));
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なCardHistoryエンティティを作成できること", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      expect(history.historyId.value).toBe(validHistoryId);
      expect(history.cardId).toBe(validCardId);
      expect(history.version).toBe(validVersion);
      expect(history.boardId).toBe(validBoardId);
      expect(history.assigneeMembershipId).toBe(validAssigneeMembershipId);
      expect(history.actorMembershipId).toBe(validActorMembershipId);
      expect(history.title).toBe(validTitle);
      expect(history.description).toBe(validDescription);
      expect(history.status).toBe(validStatus);
      expect(history.dueDate).toBe(validDueDate);
      expect(history.createdAt).toBe(validCreatedAt);
    });

    it("nullのassigneeで有効なCardHistoryエンティティを作成できること", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        null,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      expect(history.assigneeMembershipId).toBeNull();
    });

    it("nullのdue dateで有効なCardHistoryエンティティを作成できること", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        null,
        validCreatedAt
      );

      expect(history.dueDate).toBeNull();
    });

    it("デフォルトのcreatedAtでCardHistoryを作成できること", () => {
      const beforeCreate = new Date();
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate
      );
      const afterCreate = new Date();

      expect(history.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(history.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("無効な履歴IDでエラーをスローすること", () => {
      expect(() =>
        CardHistory.of(
          HistoryId.of("invalid"),
          validCardId,
          validVersion,
          validBoardId,
          validAssigneeMembershipId,
          validActorMembershipId,
          validTitle,
          validDescription,
          validStatus,
          validDueDate,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効なカードIDでエラーをスローすること", () => {
      expect(() =>
        CardHistory.of(
          HistoryId.of(validHistoryId),
          CardId.of(""),
          validVersion,
          validBoardId,
          validAssigneeMembershipId,
          validActorMembershipId,
          validTitle,
          validDescription,
          validStatus,
          validDueDate,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効なバージョンでエラーをスローすること", () => {
      expect(() =>
        CardHistory.of(
          HistoryId.of(validHistoryId),
          validCardId,
          CardVersion.of(0),
          validBoardId,
          validAssigneeMembershipId,
          validActorMembershipId,
          validTitle,
          validDescription,
          validStatus,
          validDueDate,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効なボードIDでエラーをスローすること", () => {
      expect(() =>
        CardHistory.of(
          HistoryId.of(validHistoryId),
          validCardId,
          validVersion,
          BoardId.of("invalid"),
          validAssigneeMembershipId,
          validActorMembershipId,
          validTitle,
          validDescription,
          validStatus,
          validDueDate,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効なアクターメンバーシップIDでエラーをスローすること", () => {
      expect(() =>
        CardHistory.of(
          HistoryId.of(validHistoryId),
          validCardId,
          validVersion,
          validBoardId,
          validAssigneeMembershipId,
          MembershipId.of("invalid"),
          validTitle,
          validDescription,
          validStatus,
          validDueDate,
          validCreatedAt
        )
      ).toThrow();
    });
  });

  describe("belongsToCard", () => {
    it("履歴がカードに属している場合にtrueを返すこと", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      expect(history.belongsToCard(validCardId)).toBe(true);
    });

    it("履歴がカードに属していない場合にfalseを返すこと", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      const differentCardId = CardId.of("66666666-6666-4666-8666-666666666666");
      expect(history.belongsToCard(differentCardId)).toBe(false);
    });
  });

  describe("wasActedByMember", () => {
    it("履歴がメンバーによって実行された場合にtrueを返すこと", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      expect(history.wasActedByMember(validActorMembershipId)).toBe(true);
    });

    it("履歴がメンバーによって実行されなかった場合にfalseを返すこと", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      const differentMembershipId = MembershipId.of(
        "66666666-6666-4666-8666-666666666666"
      );
      expect(history.wasActedByMember(differentMembershipId)).toBe(false);
    });
  });

  describe("toJson", () => {
    it("すべてのフィールドを含むカード履歴をJSONに変換できること", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      const json = history.toJson();

      expect(json).toEqual({
        historyId: validHistoryId,
        cardId: validCardId.toString(),
        version: validVersion.toString(),
        boardId: validBoardId.toString(),
        assigneeMembershipId: validAssigneeMembershipId.toString(),
        actorMembershipId: validActorMembershipId.toString(),
        title: validTitle.toString(),
        description: validDescription.toString(),
        status: validStatus.toString(),
        dueDate: validDueDate.toString(),
        createdAt: validCreatedAt.toISOString(),
      });
    });

    it("nullのassigneeを含むカード履歴をJSONに変換できること", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        null,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      const json = history.toJson();

      expect(json.assigneeMembershipId).toBeNull();
    });

    it("nullのdue dateを含むカード履歴をJSONに変換できること", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        null,
        validCreatedAt
      );

      const json = history.toJson();

      expect(json.dueDate).toBeNull();
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      const json = history.toJson();

      expect(typeof json.historyId).toBe("string");
      expect(typeof json.cardId).toBe("string");
      expect(typeof json.version).toBe("string");
      expect(typeof json.boardId).toBe("string");
      expect(typeof json.assigneeMembershipId).toBe("string");
      expect(typeof json.actorMembershipId).toBe("string");
      expect(typeof json.title).toBe("string");
      expect(typeof json.description).toBe("string");
      expect(typeof json.status).toBe("string");
      expect(typeof json.dueDate).toBe("string");
      expect(typeof json.createdAt).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const history = CardHistory.of(
        HistoryId.of(validHistoryId),
        validCardId,
        validVersion,
        validBoardId,
        validAssigneeMembershipId,
        validActorMembershipId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validCreatedAt
      );

      const originalHistoryId = history.historyId;
      const originalCardId = history.cardId;
      const originalVersion = history.version;
      const originalBoardId = history.boardId;
      const originalTitle = history.title;

      expect(history.historyId).toBe(originalHistoryId);
      expect(history.cardId).toBe(originalCardId);
      expect(history.version).toBe(originalVersion);
      expect(history.boardId).toBe(originalBoardId);
      expect(history.title).toBe(originalTitle);
    });
  });
});
