import { describe, it, expect } from "vitest";
import { Card } from "./Card";
import {
  CardId,
  CardTitle,
  CardDescription,
  CardStatus,
  DueDate,
  EmailAddress,
} from "../../value-object";

describe("Card", () => {
  const validCardId = CardId.of("11111111-1111-4111-8111-111111111111");
  const validTitle = CardTitle.of("Test Card");
  const validDescription = CardDescription.of("This is a test card");
  const validStatus = CardStatus.todo();
  const validDueDate = DueDate.of(new Date("2025-12-31T23:59:59Z"));
  const validAssignee = EmailAddress.of("assignee@example.com");

  describe("create", () => {
    it("有効なCardエンティティを作成できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      expect(card.id).toBe(validCardId);
      expect(card.title).toBe(validTitle);
      expect(card.description).toBe(validDescription);
      expect(card.status).toBe(validStatus);
      expect(card.dueDate).toBe(validDueDate);
      expect(card.assignee).toBe(validAssignee);
    });

    it("異なるステータスでカードを作成できること", () => {
      const todoCard = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssignee
      );
      expect(todoCard.status.isTodo()).toBe(true);

      const inProgressCard = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssignee
      );
      expect(inProgressCard.status.isInProgress()).toBe(true);

      const doneCard = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssignee
      );
      expect(doneCard.status.isDone()).toBe(true);
    });
  });

  describe("changeStatus", () => {
    it("todoからの有効なステータス遷移を許可すること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssignee
      );

      card.changeStatus(CardStatus.inProgress());
      expect(card.status.isInProgress()).toBe(true);

      const card2 = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssignee
      );
      card2.changeStatus(CardStatus.done());
      expect(card2.status.isDone()).toBe(true);
    });

    it("in_progressからの有効なステータス遷移を許可すること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssignee
      );

      card.changeStatus(CardStatus.done());
      expect(card.status.isDone()).toBe(true);

      const card2 = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssignee
      );
      card2.changeStatus(CardStatus.todo());
      expect(card2.status.isTodo()).toBe(true);
    });

    it("doneからの有効なステータス遷移を許可すること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssignee
      );

      card.changeStatus(CardStatus.inProgress());
      expect(card.status.isInProgress()).toBe(true);
    });

    it("無効なステータス遷移でエラーをスローすること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssignee
      );

      expect(() => {
        card.changeStatus(CardStatus.todo());
      }).toThrow("Cannot transition from done to todo");
    });
  });

  describe("start", () => {
    it("ステータスをin_progressに変更できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssignee
      );

      card.start();
      expect(card.status.isInProgress()).toBe(true);
    });
  });

  describe("complete", () => {
    it("ステータスをdoneに変更できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.inProgress(),
        validDueDate,
        validAssignee
      );

      card.complete();
      expect(card.status.isDone()).toBe(true);
    });
  });

  describe("reopen", () => {
    it("完了したカードを再開できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        validDueDate,
        validAssignee
      );

      card.reopen();
      expect(card.status.isInProgress()).toBe(true);
    });

    it("完了していないカードを再開しようとした場合にエラーをスローすること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssignee
      );

      expect(() => {
        card.reopen();
      }).toThrow("Only completed cards can be reopened");
    });
  });

  describe("updateTitle", () => {
    it("カードタイトルを更新できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const newTitle = CardTitle.of("Updated Title");
      card.updateTitle(newTitle);

      expect(card.title).toBe(newTitle);
      expect(card.title.value).toBe("Updated Title");
    });
  });

  describe("updateDescription", () => {
    it("カード説明を更新できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const newDescription = CardDescription.of("Updated description");
      card.updateDescription(newDescription);

      expect(card.description).toBe(newDescription);
      expect(card.description.value).toBe("Updated description");
    });
  });

  describe("assignTo", () => {
    it("担当者を変更できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const newAssignee = EmailAddress.of("newassignee@example.com");
      card.assignTo(newAssignee);

      expect(card.assignee).toBe(newAssignee);
      expect(card.assignee.value).toBe("newassignee@example.com");
    });
  });

  describe("changeDueDate", () => {
    it("期日を変更できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const newDueDate = DueDate.of(new Date("2026-01-31T23:59:59Z"));
      card.changeDueDate(newDueDate);

      expect(card.dueDate).toBe(newDueDate);
    });
  });

  describe("isOverdue", () => {
    it("完了していない期限切れカードでtrueを返すこと", () => {
      const pastDueDate = DueDate.of(new Date("2020-01-01T00:00:00Z"));
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        pastDueDate,
        validAssignee
      );

      expect(card.isOverdue()).toBe(true);
    });

    it("期限切れでも完了しているカードでfalseを返すこと", () => {
      const pastDueDate = DueDate.of(new Date("2020-01-01T00:00:00Z"));
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.done(),
        pastDueDate,
        validAssignee
      );

      expect(card.isOverdue()).toBe(false);
    });

    it("将来の期日を持つカードでfalseを返すこと", () => {
      const futureDueDate = DueDate.of(new Date("2030-01-01T00:00:00Z"));
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        futureDueDate,
        validAssignee
      );

      expect(card.isOverdue()).toBe(false);
    });
  });

  describe("toJson", () => {
    it("カードをJSONに変換できること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const json = card.toJson();

      expect(json.id).toBe(validCardId.toString());
      expect(json.title).toBe(validTitle.toString());
      expect(json.description).toBe(validDescription.toString());
      expect(json.status).toBe(validStatus.toString());
      expect(json.assignee).toBe(validAssignee.toString());
      expect(typeof json.dueDate).toBe("string");
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const json = card.toJson();

      expect(typeof json.id).toBe("string");
      expect(typeof json.title).toBe("string");
      expect(typeof json.description).toBe("string");
      expect(typeof json.status).toBe("string");
      expect(typeof json.dueDate).toBe("string");
      expect(typeof json.assignee).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用アクセスにゲッターを使用すること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        validStatus,
        validDueDate,
        validAssignee
      );

      const originalId = card.id;
      const originalTitle = card.title;

      expect(card.id).toBe(originalId);
      expect(card.title).toBe(originalTitle);
    });

    it("ビジネスロジックメソッドを通じてのみ変更を許可すること", () => {
      const card = Card.create(
        validCardId,
        validTitle,
        validDescription,
        CardStatus.todo(),
        validDueDate,
        validAssignee
      );

      const originalStatus = card.status;
      expect(originalStatus.isTodo()).toBe(true);

      card.start();
      expect(card.status.isInProgress()).toBe(true);
      expect(card.status).not.toBe(originalStatus);
    });
  });
});
