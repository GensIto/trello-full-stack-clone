import { describe, it, expect } from "vitest";
import { CardVersion } from "./CardVersion";

describe("CardVersion", () => {
  describe("of", () => {
    it("should create a valid CardVersion from positive integer", () => {
      const version = CardVersion.of(1);

      expect(version.value).toBe(1);
      expect(version.toString()).toBe("1");
    });

    it("should accept large positive integer", () => {
      const version = CardVersion.of(999999);

      expect(version.value).toBe(999999);
    });

    it("should throw error for zero", () => {
      expect(() => CardVersion.of(0)).toThrow();
    });

    it("should throw error for negative integer", () => {
      expect(() => CardVersion.of(-1)).toThrow();
    });

    it("should throw error for decimal number", () => {
      expect(() => CardVersion.of(1.5)).toThrow();
    });
  });

  describe("initial", () => {
    it("should create initial version of 1", () => {
      const version = CardVersion.initial();

      expect(version.value).toBe(1);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid positive integer", () => {
      const result = CardVersion.tryOf(5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(5);
      }
    });

    it("should return error for zero", () => {
      const result = CardVersion.tryOf(0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for negative integer", () => {
      const result = CardVersion.tryOf(-5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for decimal number", () => {
      const result = CardVersion.tryOf(2.5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("increment", () => {
    it("should return new version incremented by 1", () => {
      const version1 = CardVersion.of(1);
      const version2 = version1.increment();

      expect(version2.value).toBe(2);
    });

    it("should not mutate original version", () => {
      const version1 = CardVersion.of(5);
      const version2 = version1.increment();

      expect(version1.value).toBe(5);
      expect(version2.value).toBe(6);
    });

    it("should allow multiple increments", () => {
      const version1 = CardVersion.of(1);
      const version2 = version1.increment();
      const version3 = version2.increment();
      const version4 = version3.increment();

      expect(version1.value).toBe(1);
      expect(version2.value).toBe(2);
      expect(version3.value).toBe(3);
      expect(version4.value).toBe(4);
    });

    it("should increment from initial version", () => {
      const version1 = CardVersion.initial();
      const version2 = version1.increment();

      expect(version1.value).toBe(1);
      expect(version2.value).toBe(2);
    });
  });

  describe("equals", () => {
    it("should return true for same version values", () => {
      const version1 = CardVersion.of(5);
      const version2 = CardVersion.of(5);

      expect(version1.equals(version2)).toBe(true);
    });

    it("should return false for different version values", () => {
      const version1 = CardVersion.of(5);
      const version2 = CardVersion.of(6);

      expect(version1.equals(version2)).toBe(false);
    });

    it("should return true for initial versions", () => {
      const version1 = CardVersion.initial();
      const version2 = CardVersion.of(1);

      expect(version1.equals(version2)).toBe(true);
    });
  });

  describe("isNewer", () => {
    it("should return true when version is newer", () => {
      const version1 = CardVersion.of(5);
      const version2 = CardVersion.of(3);

      expect(version1.isNewer(version2)).toBe(true);
    });

    it("should return false when version is older", () => {
      const version1 = CardVersion.of(3);
      const version2 = CardVersion.of(5);

      expect(version1.isNewer(version2)).toBe(false);
    });

    it("should return false when versions are equal", () => {
      const version1 = CardVersion.of(5);
      const version2 = CardVersion.of(5);

      expect(version1.isNewer(version2)).toBe(false);
    });

    it("should work with incremented versions", () => {
      const version1 = CardVersion.of(5);
      const version2 = version1.increment();

      expect(version2.isNewer(version1)).toBe(true);
      expect(version1.isNewer(version2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return version as string", () => {
      const version = CardVersion.of(42);

      expect(version.toString()).toBe("42");
    });

    it("should return string representation for all versions", () => {
      expect(CardVersion.of(1).toString()).toBe("1");
      expect(CardVersion.of(999).toString()).toBe("999");
      expect(CardVersion.initial().toString()).toBe("1");
    });
  });
});
