import { describe, it, expect } from "vitest";
import { BoardId } from "./BoardId";

describe("BoardId", () => {
  describe("of", () => {
    it("should create a valid BoardId from UUID string", () => {
      const uuid = "11111111-1111-4111-8111-111111111111";
      const boardId = BoardId.of(uuid);

      expect(boardId.value).toBe(uuid);
      expect(boardId.toString()).toBe(uuid);
    });

    it("should throw error for invalid UUID format", () => {
      expect(() => BoardId.of("invalid-uuid")).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => BoardId.of("")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("should return success for valid UUID", () => {
      const uuid = "22222222-2222-4222-8222-222222222222";
      const result = BoardId.tryOf(uuid);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(uuid);
      }
    });

    it("should return error for invalid UUID", () => {
      const result = BoardId.tryOf("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same UUID values", () => {
      const uuid = "33333333-3333-4333-8333-333333333333";
      const id1 = BoardId.of(uuid);
      const id2 = BoardId.of(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different UUID values", () => {
      const id1 = BoardId.of("11111111-1111-4111-8111-111111111111");
      const id2 = BoardId.of("22222222-2222-4222-8222-222222222222");

      expect(id1.equals(id2)).toBe(false);
    });
  });
});
