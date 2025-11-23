import { describe, it, expect } from "vitest";
import { BoardName } from "./BoardName";

describe("BoardName", () => {
  describe("of", () => {
    it("should create a valid BoardName from string", () => {
      const name = "Project Board";
      const boardName = BoardName.of(name);

      expect(boardName.value).toBe(name);
      expect(boardName.toString()).toBe(name);
    });

    it("should trim whitespace", () => {
      const boardName = BoardName.of("  Sprint Board  ");

      expect(boardName.value).toBe("Sprint Board");
    });

    it("should throw error for empty string", () => {
      expect(() => BoardName.of("")).toThrow("Board name is required");
    });

    it("should accept whitespace only (trimmed to empty is not validated by Zod)", () => {
      const boardName = BoardName.of("   ");
      expect(boardName.value).toBe("");
    });

    it("should throw error for name exceeding 100 characters", () => {
      const longName = "a".repeat(101);
      expect(() => BoardName.of(longName)).toThrow(
        "Board name must be 100 characters or less"
      );
    });

    it("should accept name with exactly 100 characters", () => {
      const maxName = "a".repeat(100);
      const boardName = BoardName.of(maxName);

      expect(boardName.value).toBe(maxName);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid name", () => {
      const name = "Valid Board";
      const result = BoardName.tryOf(name);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(name);
      }
    });

    it("should return error for empty string", () => {
      const result = BoardName.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for too long name", () => {
      const result = BoardName.tryOf("a".repeat(101));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same name values", () => {
      const name = "Same Board";
      const name1 = BoardName.of(name);
      const name2 = BoardName.of(name);

      expect(name1.equals(name2)).toBe(true);
    });

    it("should return false for different name values", () => {
      const name1 = BoardName.of("Board One");
      const name2 = BoardName.of("Board Two");

      expect(name1.equals(name2)).toBe(false);
    });
  });
});
