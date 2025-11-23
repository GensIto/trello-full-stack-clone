import { describe, it, expect } from "vitest";
import { CardActivity, ActivityId } from "./CardActivity";
import { CardId, MembershipId } from "../../value-object";
import { HistoryId } from "../CardHistory/CardHistory";

describe("ActivityId", () => {
  const validId = "11111111-1111-4111-8111-111111111111";

  describe("of", () => {
    it("有効なActivityIdを作成できること", () => {
      const id = ActivityId.of(validId);

      expect(id.value).toBe(validId);
    });

    it("無効なUUIDでエラーをスローすること", () => {
      expect(() => ActivityId.of("invalid")).toThrow();
    });
  });

  describe("equals", () => {
    it("等しいIDでtrueを返すこと", () => {
      const id1 = ActivityId.of(validId);
      const id2 = ActivityId.of(validId);

      expect(id1.equals(id2)).toBe(true);
    });

    it("異なるIDでfalseを返すこと", () => {
      const id1 = ActivityId.of(validId);
      const id2 = ActivityId.of("22222222-2222-4222-8222-222222222222");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("文字列値を返すこと", () => {
      const id = ActivityId.of(validId);

      expect(id.toString()).toBe(validId);
    });
  });
});

describe("CardActivity", () => {
  const validActivityId = "11111111-1111-4111-8111-111111111111";
  const validCardId = CardId.of("22222222-2222-4222-8222-222222222222");
  const validHistoryId = HistoryId.of("33333333-3333-4333-8333-333333333333");
  const validActorMembershipId = MembershipId.of(
    "44444444-4444-4444-8444-444444444444"
  );
  const validAction = "Card created";
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なCardActivityエンティティを作成できること", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      expect(activity.activityId.value).toBe(validActivityId);
      expect(activity.cardId).toBe(validCardId);
      expect(activity.historyId).toBe(validHistoryId);
      expect(activity.actorMembershipId).toBe(validActorMembershipId);
      expect(activity.action).toBe(validAction);
      expect(activity.createdAt).toBe(validCreatedAt);
    });

    it("デフォルトのcreatedAtでCardActivityを作成できること", () => {
      const beforeCreate = new Date();
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction
      );
      const afterCreate = new Date();

      expect(activity.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(activity.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
    });

    it("異なるアクションタイプでアクティビティを作成できること", () => {
      const actions = [
        "Card created",
        "Title updated",
        "Description changed",
        "Status changed to in_progress",
        "Card assigned to user",
        "Due date changed",
      ];

      actions.forEach((action) => {
        const activity = CardActivity.of(
          ActivityId.of(validActivityId),
          validCardId,
          validHistoryId,
          validActorMembershipId,
          action,
          validCreatedAt
        );

        expect(activity.action).toBe(action);
      });
    });

    it("無効なアクティビティIDでエラーをスローすること", () => {
      expect(() =>
        CardActivity.of(
          ActivityId.of("invalid"),
          validCardId,
          validHistoryId,
          validActorMembershipId,
          validAction,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効なカードIDでエラーをスローすること", () => {
      expect(() =>
        CardActivity.of(
          ActivityId.of(validActivityId),
          CardId.of(""),
          validHistoryId,
          validActorMembershipId,
          validAction,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効な履歴IDでエラーをスローすること", () => {
      expect(() =>
        CardActivity.of(
          ActivityId.of(validActivityId),
          validCardId,
          HistoryId.of("invalid"),
          validActorMembershipId,
          validAction,
          validCreatedAt
        )
      ).toThrow();
    });

    it("無効なアクターメンバーシップIDでエラーをスローすること", () => {
      expect(() =>
        CardActivity.of(
          ActivityId.of(validActivityId),
          validCardId,
          validHistoryId,
          MembershipId.of("invalid"),
          validAction,
          validCreatedAt
        )
      ).toThrow();
    });

    it("空のアクションでエラーをスローすること", () => {
      expect(() =>
        CardActivity.of(
          ActivityId.of(validActivityId),
          validCardId,
          validHistoryId,
          validActorMembershipId,
          "",
          validCreatedAt
        )
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なアクティビティで成功を返すこと", () => {
      const result = CardActivity.tryOf(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.activityId.value).toBe(validActivityId);
        expect(result.value.cardId).toBe(validCardId);
        expect(result.value.historyId).toBe(validHistoryId);
        expect(result.value.actorMembershipId).toBe(validActorMembershipId);
        expect(result.value.action).toBe(validAction);
        expect(result.value.createdAt).toBe(validCreatedAt);
      }
    });

    it("デフォルトのcreatedAtで成功を返すこと", () => {
      const result = CardActivity.tryOf(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.activityId.value).toBe(validActivityId);
        expect(result.value.action).toBe(validAction);
      }
    });

    it("空のアクションでエラーを返すこと", () => {
      const result = CardActivity.tryOf(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        "",
        validCreatedAt
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it("無効なアクティビティIDでエラーを返すこと", () => {
      expect(() => {
        ActivityId.of("invalid");
      }).toThrow();
    });
  });

  describe("belongsToCard", () => {
    it("アクティビティがカードに属している場合にtrueを返すこと", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      expect(activity.belongsToCard(validCardId)).toBe(true);
    });

    it("アクティビティがカードに属していない場合にfalseを返すこと", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      const differentCardId = CardId.of("55555555-5555-4555-8555-555555555555");
      expect(activity.belongsToCard(differentCardId)).toBe(false);
    });
  });

  describe("wasPerformedByMember", () => {
    it("アクティビティがメンバーによって実行された場合にtrueを返すこと", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      expect(activity.wasPerformedByMember(validActorMembershipId)).toBe(true);
    });

    it("アクティビティがメンバーによって実行されなかった場合にfalseを返すこと", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      const differentMembershipId = MembershipId.of(
        "55555555-5555-4555-8555-555555555555"
      );
      expect(activity.wasPerformedByMember(differentMembershipId)).toBe(false);
    });
  });

  describe("toJson", () => {
    it("カードアクティビティをJSONに変換できること", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      const json = activity.toJson();

      expect(json).toEqual({
        activityId: validActivityId,
        cardId: validCardId.toString(),
        historyId: validHistoryId.toString(),
        actorMembershipId: validActorMembershipId.toString(),
        action: validAction,
        createdAt: validCreatedAt.toISOString(),
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      const json = activity.toJson();

      expect(typeof json.activityId).toBe("string");
      expect(typeof json.cardId).toBe("string");
      expect(typeof json.historyId).toBe("string");
      expect(typeof json.actorMembershipId).toBe("string");
      expect(typeof json.action).toBe("string");
      expect(typeof json.createdAt).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const activity = CardActivity.of(
        ActivityId.of(validActivityId),
        validCardId,
        validHistoryId,
        validActorMembershipId,
        validAction,
        validCreatedAt
      );

      const originalActivityId = activity.activityId;
      const originalCardId = activity.cardId;
      const originalHistoryId = activity.historyId;
      const originalAction = activity.action;

      expect(activity.activityId).toBe(originalActivityId);
      expect(activity.cardId).toBe(originalCardId);
      expect(activity.historyId).toBe(originalHistoryId);
      expect(activity.action).toBe(originalAction);
    });
  });
});
