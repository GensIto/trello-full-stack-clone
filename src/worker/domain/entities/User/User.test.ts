import { describe, it, expect } from "vitest";
import { User } from "./User";
import { EmailAddress } from "../../value-object";

describe("User", () => {
  const validUserId = "11111111-1111-4111-8111-111111111111";
  const validName = "John Doe";
  const validEmail = EmailAddress.of("john.doe@example.com");
  const validImage = "https://example.com/avatar.jpg";
  const validCreatedAt = new Date("2024-01-01T00:00:00Z");
  const validUpdatedAt = new Date("2024-01-02T00:00:00Z");

  describe("of", () => {
    it("すべてのパラメータで有効なUserエンティティを作成できること", () => {
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt,
        null
      );

      expect(user.userId).toBe(validUserId);
      expect(user.name).toBe(validName);
      expect(user.email).toBe(validEmail);
      expect(user.image).toBe(validImage);
      expect(user.createdAt).toBe(validCreatedAt);
      expect(user.updatedAt).toBe(validUpdatedAt);
      expect(user.deletedAt).toBeNull();
    });

    it("デフォルトパラメータで有効なUserエンティティを作成できること", () => {
      const beforeCreate = new Date();
      const user = User.of(validUserId, validName, validEmail);
      const afterCreate = new Date();

      expect(user.userId).toBe(validUserId);
      expect(user.name).toBe(validName);
      expect(user.email).toBe(validEmail);
      expect(user.image).toBeNull();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime()
      );
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime()
      );
      expect(user.deletedAt).toBeNull();
    });

    it("deletedAt日付付きでUserを作成できること", () => {
      const deletedAt = new Date("2024-01-03T00:00:00Z");
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt,
        deletedAt
      );

      expect(user.deletedAt).toBe(deletedAt);
    });

    it("無効なユーザーIDでエラーをスローすること", () => {
      expect(() => User.of("invalid-id", validName, validEmail)).toThrow();
    });

    it("空の名前でエラーをスローすること", () => {
      expect(() => User.of(validUserId, "", validEmail)).toThrow();
    });

    it("名前が長すぎる場合にエラーをスローすること", () => {
      const longName = "a".repeat(101);
      expect(() => User.of(validUserId, longName, validEmail)).toThrow();
    });

    it("無効な画像URLでエラーをスローすること", () => {
      expect(() =>
        User.of(validUserId, validName, validEmail, "not-a-url")
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なユーザーで成功を返すこと", () => {
      const result = User.tryOf(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt,
        null
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.name).toBe(validName);
        expect(result.value.email).toBe(validEmail);
        expect(result.value.image).toBe(validImage);
        expect(result.value.createdAt).toBe(validCreatedAt);
        expect(result.value.updatedAt).toBe(validUpdatedAt);
        expect(result.value.deletedAt).toBeNull();
      }
    });

    it("デフォルトパラメータで成功を返すこと", () => {
      const result = User.tryOf(validUserId, validName, validEmail);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.name).toBe(validName);
        expect(result.value.email).toBe(validEmail);
        expect(result.value.image).toBeNull();
        expect(result.value.deletedAt).toBeNull();
      }
    });

    it("無効なユーザーIDでエラーを返すこと", () => {
      const result = User.tryOf("invalid-id", validName, validEmail);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it("空の名前でエラーを返すこと", () => {
      const result = User.tryOf(validUserId, "", validEmail);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it("名前が長すぎる場合にエラーを返すこと", () => {
      const longName = "a".repeat(101);
      const result = User.tryOf(validUserId, longName, validEmail);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });
  });

  describe("isDeleted", () => {
    it("deletedAtがnullの場合にfalseを返すこと", () => {
      const user = User.of(validUserId, validName, validEmail);

      expect(user.isDeleted()).toBe(false);
    });

    it("deletedAtが設定されている場合にtrueを返すこと", () => {
      const deletedAt = new Date("2024-01-03T00:00:00Z");
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        null,
        validCreatedAt,
        validUpdatedAt,
        deletedAt
      );

      expect(user.isDeleted()).toBe(true);
    });
  });

  describe("toJson", () => {
    it("ユーザーをJSONに変換できること", () => {
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt,
        null
      );

      const json = user.toJson();

      expect(json).toEqual({
        userId: validUserId,
        name: validName,
        email: validEmail.value,
        image: validImage,
        createdAt: validCreatedAt.toISOString(),
        updatedAt: validUpdatedAt.toISOString(),
        deletedAt: null,
      });
    });

    it("deletedAt付きのユーザーをJSONに変換できること", () => {
      const deletedAt = new Date("2024-01-03T00:00:00Z");
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt,
        deletedAt
      );

      const json = user.toJson();

      expect(json.deletedAt).toBe(deletedAt.toISOString());
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const user = User.of(
        validUserId,
        validName,
        validEmail,
        validImage,
        validCreatedAt,
        validUpdatedAt,
        null
      );

      const json = user.toJson();

      expect(typeof json.userId).toBe("string");
      expect(typeof json.name).toBe("string");
      expect(typeof json.email).toBe("string");
      expect(typeof json.createdAt).toBe("string");
      expect(typeof json.updatedAt).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const user = User.of(validUserId, validName, validEmail);

      const originalUserId = user.userId;
      const originalName = user.name;
      const originalEmail = user.email;

      expect(user.userId).toBe(originalUserId);
      expect(user.name).toBe(originalName);
      expect(user.email).toBe(originalEmail);
    });
  });
});
