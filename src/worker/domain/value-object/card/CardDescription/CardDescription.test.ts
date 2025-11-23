import { describe, it, expect } from "vitest";
import { CardDescription } from "./CardDescription";

describe("CardDescription", () => {
  describe("of", () => {
    it("should create a valid CardDescription from string", () => {
      const description = "This is a card description";
      const cardDescription = CardDescription.of(description);

      expect(cardDescription.value).toBe(description);
      expect(cardDescription.toString()).toBe(description);
    });

    it("should accept empty string", () => {
      const cardDescription = CardDescription.of("");

      expect(cardDescription.value).toBe("");
      expect(cardDescription.isEmpty()).toBe(true);
    });

    it("should throw error for string exceeding max length", () => {
      const longDescription = "a".repeat(2001);
      expect(() => CardDescription.of(longDescription)).toThrow();
    });

    it("should accept description at max length", () => {
      const maxLengthDescription = "a".repeat(2000);
      const cardDescription = CardDescription.of(maxLengthDescription);

      expect(cardDescription.value).toBe(maxLengthDescription);
    });

    it("should accept description with multiple lines", () => {
      const description = "Line 1\nLine 2\nLine 3";
      const cardDescription = CardDescription.of(description);

      expect(cardDescription.value).toBe(description);
    });

    it("should accept description with special characters", () => {
      const description = "Description with @mentions, #tags, and [links]";
      const cardDescription = CardDescription.of(description);

      expect(cardDescription.value).toBe(description);
    });
  });

  describe("empty", () => {
    it("should create an empty CardDescription", () => {
      const cardDescription = CardDescription.empty();

      expect(cardDescription.value).toBe("");
      expect(cardDescription.isEmpty()).toBe(true);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid description", () => {
      const description = "Valid description";
      const result = CardDescription.tryOf(description);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(description);
      }
    });

    it("should return success for empty string", () => {
      const result = CardDescription.tryOf("");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("");
        expect(result.value.isEmpty()).toBe(true);
      }
    });

    it("should return error for string exceeding max length", () => {
      const longDescription = "a".repeat(2001);
      const result = CardDescription.tryOf(longDescription);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty string", () => {
      const cardDescription = CardDescription.of("");

      expect(cardDescription.isEmpty()).toBe(true);
    });

    it("should return true for whitespace-only string", () => {
      const cardDescription = CardDescription.of("   \n  \t  ");

      expect(cardDescription.isEmpty()).toBe(true);
    });

    it("should return false for non-empty description", () => {
      const cardDescription = CardDescription.of("Not empty");

      expect(cardDescription.isEmpty()).toBe(false);
    });

    it("should return false for description with content and whitespace", () => {
      const cardDescription = CardDescription.of("  Content  ");

      expect(cardDescription.isEmpty()).toBe(false);
    });
  });

  describe("equals", () => {
    it("should return true for same description values", () => {
      const description = "Same description";
      const desc1 = CardDescription.of(description);
      const desc2 = CardDescription.of(description);

      expect(desc1.equals(desc2)).toBe(true);
    });

    it("should return false for different description values", () => {
      const desc1 = CardDescription.of("Description 1");
      const desc2 = CardDescription.of("Description 2");

      expect(desc1.equals(desc2)).toBe(false);
    });

    it("should return true for both empty descriptions", () => {
      const desc1 = CardDescription.of("");
      const desc2 = CardDescription.empty();

      expect(desc1.equals(desc2)).toBe(true);
    });

    it("should return false for empty vs whitespace description", () => {
      const desc1 = CardDescription.of("");
      const desc2 = CardDescription.of("   ");

      expect(desc1.equals(desc2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return the description string", () => {
      const description = "Test description";
      const cardDescription = CardDescription.of(description);

      expect(cardDescription.toString()).toBe(description);
    });

    it("should return empty string for empty description", () => {
      const cardDescription = CardDescription.empty();

      expect(cardDescription.toString()).toBe("");
    });
  });
});
