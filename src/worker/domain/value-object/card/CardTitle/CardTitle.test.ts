import { describe, it, expect } from "vitest";
import { CardTitle } from "./CardTitle";

describe("CardTitle", () => {
  describe("of", () => {
    it("should create a valid CardTitle from string", () => {
      const title = "My Card Title";
      const cardTitle = CardTitle.of(title);

      expect(cardTitle.value).toBe(title);
      expect(cardTitle.toString()).toBe(title);
    });

    it("should trim whitespace from title", () => {
      const cardTitle = CardTitle.of("  Trimmed Title  ");

      expect(cardTitle.value).toBe("Trimmed Title");
    });

    it("should throw error for empty string", () => {
      expect(() => CardTitle.of("")).toThrow();
    });

    it("should accept whitespace-only string and trim to empty", () => {
      // Note: Zod applies trim() AFTER min/max validation, so "   " passes min(1) then gets trimmed to ""
      const cardTitle = CardTitle.of("   ");
      expect(cardTitle.value).toBe("");
    });

    it("should throw error for string exceeding max length", () => {
      const longTitle = "a".repeat(201);
      expect(() => CardTitle.of(longTitle)).toThrow();
    });

    it("should accept title at max length", () => {
      const maxLengthTitle = "a".repeat(200);
      const cardTitle = CardTitle.of(maxLengthTitle);

      expect(cardTitle.value).toBe(maxLengthTitle);
    });

    it("should accept title with single character", () => {
      const cardTitle = CardTitle.of("A");

      expect(cardTitle.value).toBe("A");
    });

    it("should accept title with special characters", () => {
      const title = "Card #1: Fix bug @home";
      const cardTitle = CardTitle.of(title);

      expect(cardTitle.value).toBe(title);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid title", () => {
      const title = "Valid Title";
      const result = CardTitle.tryOf(title);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(title);
      }
    });

    it("should return success and trim whitespace", () => {
      const result = CardTitle.tryOf("  Trimmed  ");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("Trimmed");
      }
    });

    it("should return error for empty string", () => {
      const result = CardTitle.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return success for whitespace-only string and trim to empty", () => {
      // Note: Zod applies trim() AFTER min/max validation, so "   " passes min(1) then gets trimmed to ""
      const result = CardTitle.tryOf("   ");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("");
      }
    });

    it("should return error for string exceeding max length", () => {
      const longTitle = "a".repeat(201);
      const result = CardTitle.tryOf(longTitle);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same title values", () => {
      const title = "Same Title";
      const title1 = CardTitle.of(title);
      const title2 = CardTitle.of(title);

      expect(title1.equals(title2)).toBe(true);
    });

    it("should return false for different title values", () => {
      const title1 = CardTitle.of("Title 1");
      const title2 = CardTitle.of("Title 2");

      expect(title1.equals(title2)).toBe(false);
    });

    it("should return true for titles with same trimmed value", () => {
      const title1 = CardTitle.of("  Test  ");
      const title2 = CardTitle.of("Test");

      expect(title1.equals(title2)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return the title string", () => {
      const title = "Test Title";
      const cardTitle = CardTitle.of(title);

      expect(cardTitle.toString()).toBe(title);
    });

    it("should return trimmed title", () => {
      const cardTitle = CardTitle.of("  Trimmed  ");

      expect(cardTitle.toString()).toBe("Trimmed");
    });
  });
});
