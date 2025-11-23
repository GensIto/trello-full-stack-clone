import { describe, it, expect } from "vitest";
import { Card } from "./Card";
import {
  CardId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
  MembershipId,
} from "../../value-object";

describe("Card", () => {
  const validCardId = CardId.of("11111111-1111-4111-8111-111111111111");
  const validTitle = CardTitle.of("Test Card");
  const validDescription = CardDescription.of("This is a test card");
  const validStatus = CardStatus.todo();
  const validDueDate = DueDate.of(new Date("2025-12-31T23:59:59Z"));
  const validAssigneeMembershipId = MembershipId.of(
    "550e8400-e29b-41d4-a716-446655440000"
  );

  describe("of", () => {
    it("有効なCardエンティティを作成できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      expect(card.id).toBe(validCardId);
      expect(card.title).toBe(validTitle);
      expect(card.description).toBe(validDescription);
      expect(card.status).toBe(validStatus);
      expect(card.dueDate).toBe(validDueDate);
      expect(card.assigneeMembershipId).toBe(validAssigneeMembershipId);
    });

    it("異なるステータスでカードを作成できること", () => {
      const todoCard = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssigneeMembershipId
      );
      expect(todoCard.status.isTodo()).toBe(true);

      const inProgressCard = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssigneeMembershipId
      );
      expect(inProgressCard.status.isInProgress()).toBe(true);

      const doneCard = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssigneeMembershipId
      );
      expect(doneCard.status.isDone()).toBe(true);
    });
  });

  describe("changeStatus", () => {
    it("todoからの有効なステータス遷移を許可すること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssigneeMembershipId
      );

      const updatedCard = card.changeStatus(CardStatus.inProgress());
      expect(updatedCard.status.isInProgress()).toBe(true);
      expect(card.status.isTodo()).toBe(true); // 元のカードは不変

      const card2 = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssigneeMembershipId
      );
      const updatedCard2 = card2.changeStatus(CardStatus.done());
      expect(updatedCard2.status.isDone()).toBe(true);
    });

    it("in_progressからの有効なステータス遷移を許可すること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssigneeMembershipId
      );

      const updatedCard = card.changeStatus(CardStatus.done());
      expect(updatedCard.status.isDone()).toBe(true);

      const card2 = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssigneeMembershipId
      );
      const updatedCard2 = card2.changeStatus(CardStatus.todo());
      expect(updatedCard2.status.isTodo()).toBe(true);
    });

    it("doneからの有効なステータス遷移を許可すること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssigneeMembershipId
      );

      const updatedCard = card.changeStatus(CardStatus.inProgress());
      expect(updatedCard.status.isInProgress()).toBe(true);
    });

    it("無効なステータス遷移でエラーをスローすること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssigneeMembershipId
      );

      expect(() => {
        card.changeStatus(CardStatus.todo());
      }).toThrow("Cannot transition from done to todo");
    });
  });

  describe("start", () => {
    it("ステータスをin_progressに変更できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssigneeMembershipId
      );

      const startedCard = card.start();
      expect(startedCard.status.isInProgress()).toBe(true);
      expect(card.status.isTodo()).toBe(true); // 元のカードは不変
    });
  });

  describe("complete", () => {
    it("ステータスをdoneに変更できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssigneeMembershipId
      );

      const completedCard = card.complete();
      expect(completedCard.status.isDone()).toBe(true);
      expect(card.status.isInProgress()).toBe(true); // 元のカードは不変
    });
  });

  describe("reopen", () => {
    it("完了したカードを再開できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssigneeMembershipId
      );

      const reopenedCard = card.reopen();
      expect(reopenedCard.status.isInProgress()).toBe(true);
      expect(card.status.isDone()).toBe(true); // 元のカードは不変
    });

    it("完了していないカードを再開しようとした場合にエラーをスローすること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssigneeMembershipId
      );

      expect(() => {
        card.reopen();
      }).toThrow("Only completed cards can be reopened");
    });
  });

  describe("updateTitle", () => {
    it("カードタイトルを更新できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const newTitle = CardTitle.of("Updated Title");
      const updatedCard = card.updateTitle(newTitle);

      expect(updatedCard.title).toBe(newTitle);
      expect(updatedCard.title.value).toBe("Updated Title");
      expect(card.title).toBe(validTitle); // 元のカードは不変
    });
  });

  describe("updateDescription", () => {
    it("カード説明を更新できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const newDescription = CardDescription.of("Updated description");
      const updatedCard = card.updateDescription(newDescription);

      expect(updatedCard.description).toBe(newDescription);
      expect(updatedCard.description.value).toBe("Updated description");
      expect(card.description).toBe(validDescription); // 元のカードは不変
    });
  });

  describe("assignTo", () => {
    it("担当者を変更できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const newMembershipId = MembershipId.of(
        "660e8400-e29b-41d4-a716-446655440001"
      );
      const assignedCard = card.assignTo(newMembershipId);

      expect(assignedCard.assigneeMembershipId).toBe(newMembershipId);
      expect(card.assigneeMembershipId).toBe(validAssigneeMembershipId); // 元のカードは不変
    });
  });

  describe("changeDueDate", () => {
    it("期日を変更できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const newDueDate = DueDate.of(new Date("2026-01-31T23:59:59Z"));
      const updatedCard = card.changeDueDate(newDueDate);

      expect(updatedCard.dueDate).toBe(newDueDate);
      expect(card.dueDate).toBe(validDueDate); // 元のカードは不変
    });
  });

  describe("isOverdue", () => {
    it("完了していない期限切れカードでtrueを返すこと", () => {
      const pastDueDate = DueDate.of(new Date("2020-01-01T00:00:00Z"));
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        pastDueDate,
        validAssigneeMembershipId
      );

      expect(card.isOverdue()).toBe(true);
    });

    it("期限切れでも完了しているカードでfalseを返すこと", () => {
      const pastDueDate = DueDate.of(new Date("2020-01-01T00:00:00Z"));
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        pastDueDate,
        validAssigneeMembershipId
      );

      expect(card.isOverdue()).toBe(false);
    });

    it("将来の期日を持つカードでfalseを返すこと", () => {
      const futureDueDate = DueDate.of(new Date("2030-01-01T00:00:00Z"));
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        futureDueDate,
        validAssigneeMembershipId
      );

      expect(card.isOverdue()).toBe(false);
    });
  });

  describe("toJson", () => {
    it("カードをJSONに変換できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const json = card.toJson();

      expect(json.id).toBe(validCardId.value);
      expect(json.title).toBe(validTitle.value);
      expect(json.description).toBe(validDescription.value);
      expect(json.status).toBe(validStatus.value);
      expect(json.assigneeMembershipId).toBe(validAssigneeMembershipId.value);
      expect(typeof json.dueDate).toBe("string");
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const json = card.toJson();

      expect(typeof json.id).toBe("string");
      expect(typeof json.title).toBe("string");
      expect(typeof json.description).toBe("string");
      expect(typeof json.status).toBe("string");
      expect(typeof json.dueDate).toBe("string");
      expect(typeof json.assigneeMembershipId).toBe("string");
    });

    it("未割り当てカードのJSONでassigneeがnullであること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        null
      );

      const json = card.toJson();

      expect(json.assigneeMembershipId).toBeNull();
    });
  });

  describe("immutability", () => {
    it("読み取り専用アクセスにゲッターを使用すること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const originalId = card.id;
      const originalTitle = card.title;

      expect(card.id).toBe(originalId);
      expect(card.title).toBe(originalTitle);
    });

    it("ビジネスロジックメソッドが新しいインスタンスを返すこと", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssigneeMembershipId
      );

      const originalStatus = card.status;
      expect(originalStatus.isTodo()).toBe(true);

      const startedCard = card.start();

      // 新しいインスタンスが返される
      expect(startedCard).not.toBe(card);
      expect(startedCard.status.isInProgress()).toBe(true);

      // 元のカードは変更されていない
      expect(card.status.isTodo()).toBe(true);
      expect(card.status).toBe(originalStatus);
    });
  });

  describe("isAssigned", () => {
    it("担当者が割り当てられている場合trueを返すこと", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      expect(card.isAssigned()).toBe(true);
    });

    it("担当者が未割り当ての場合falseを返すこと", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        null
      );

      expect(card.isAssigned()).toBe(false);
    });
  });

  describe("unassign", () => {
    it("担当者を解除できること", () => {
      const card = Card.of(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssigneeMembershipId
      );

      const unassignedCard = card.unassign();

      expect(unassignedCard.assigneeMembershipId).toBeNull();
      expect(unassignedCard.isAssigned()).toBe(false);
      expect(card.assigneeMembershipId).toBe(validAssigneeMembershipId); // 元のカードは不変
    });
  });
});
