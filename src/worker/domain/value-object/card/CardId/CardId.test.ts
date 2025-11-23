import { describe, it, expect } from "vitest";
import { CardId } from "./CardId";

describe("CardId", () => {
  describe("of", () => {
    it("should create a valid CardId from string", () => {
      const id = "card-123";
      const cardId = CardId.of(id);

      expect(cardId.value).toBe(id);
      expect(cardId.toString()).toBe(id);
    });

    it("should throw error for empty string", () => {
      expect(() => CardId.of("")).toThrow();
    });

    it("should throw error for string exceeding max length", () => {
      const longId = "a".repeat(101);
      expect(() => CardId.of(longId)).toThrow();
    });

    it("should accept ID at max length", () => {
      const maxLengthId = "a".repeat(100);
      const cardId = CardId.of(maxLengthId);

      expect(cardId.value).toBe(maxLengthId);
    });

    it("should accept ID with single character", () => {
      const cardId = CardId.of("1");

      expect(cardId.value).toBe("1");
    });
  });

  describe("tryOf", () => {
    it("should return success for valid ID", () => {
      const id = "card-456";
      const result = CardId.tryOf(id);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(id);
      }
    });

    it("should return error for empty string", () => {
      const result = CardId.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for string exceeding max length", () => {
      const longId = "a".repeat(101);
      const result = CardId.tryOf(longId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same ID values", () => {
      const id = "card-789";
      const id1 = CardId.of(id);
      const id2 = CardId.of(id);

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different ID values", () => {
      const id1 = CardId.of("card-1");
      const id2 = CardId.of("card-2");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return the ID string", () => {
      const id = "card-abc";
      const cardId = CardId.of(id);

      expect(cardId.toString()).toBe(id);
    });
  });
});
