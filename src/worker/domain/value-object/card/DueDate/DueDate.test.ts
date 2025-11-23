import { describe, it, expect, beforeEach, vi } from "vitest";
import { DueDate } from "./DueDate";

describe("DueDate", () => {
  beforeEach(() => {
    // Reset system time before each test
    vi.useRealTimers();
  });

  describe("of", () => {
    it("should create a valid DueDate from Date", () => {
      const date = new Date("2025-12-31");
      const dueDate = DueDate.of(date);

      expect(dueDate.value).toEqual(date);
      expect(dueDate.toString()).toBe(date.toISOString());
    });

    it("should create a defensive copy of the date", () => {
      const date = new Date("2025-12-31");
      const dueDate = DueDate.of(date);

      // Mutate original date
      date.setFullYear(2026);

      // DueDate should not be affected
      expect(dueDate.value.getFullYear()).toBe(2025);
    });

    it("should accept past dates", () => {
      const pastDate = new Date("2020-01-01");
      const dueDate = DueDate.of(pastDate);

      expect(dueDate.value).toEqual(pastDate);
    });

    it("should accept future dates", () => {
      const futureDate = new Date("2030-01-01");
      const dueDate = DueDate.of(futureDate);

      expect(dueDate.value).toEqual(futureDate);
    });

    it("should accept current date", () => {
      const now = new Date();
      const dueDate = DueDate.of(now);

      expect(dueDate.value.getTime()).toBe(now.getTime());
    });
  });

  describe("ofFuture", () => {
    it("should create DueDate for future date", () => {
      const futureDate = new Date(Date.now() + 86400000); // tomorrow
      const dueDate = DueDate.ofFuture(futureDate);

      expect(dueDate.value).toEqual(futureDate);
    });

    it("should throw error for past date", () => {
      const pastDate = new Date("2020-01-01");
      expect(() => DueDate.ofFuture(pastDate)).toThrow("Due date must be in the future");
    });

    it("should throw error for current date", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      expect(() => DueDate.ofFuture(now)).toThrow("Due date must be in the future");

      vi.useRealTimers();
    });
  });

  describe("tryOf", () => {
    it("should return success for valid date", () => {
      const date = new Date("2025-12-31");
      const result = DueDate.tryOf(date);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toEqual(date);
      }
    });

    it("should return success for past date", () => {
      const pastDate = new Date("2020-01-01");
      const result = DueDate.tryOf(pastDate);

      expect(result.success).toBe(true);
    });
  });

  describe("isOverdue", () => {
    it("should return true for past date", () => {
      const pastDate = new Date("2020-01-01");
      const dueDate = DueDate.of(pastDate);

      expect(dueDate.isOverdue()).toBe(true);
    });

    it("should return false for future date", () => {
      const futureDate = new Date(Date.now() + 86400000); // tomorrow
      const dueDate = DueDate.of(futureDate);

      expect(dueDate.isOverdue()).toBe(false);
    });

    it("should return true for date in the past by milliseconds", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const pastDate = new Date(now.getTime() - 1000); // 1 second ago
      const dueDate = DueDate.of(pastDate);

      expect(dueDate.isOverdue()).toBe(true);

      vi.useRealTimers();
    });
  });

  describe("isSoon", () => {
    it("should return true for date within default 3 days", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const soonDate = new Date(now.getTime() + 2 * 86400000); // 2 days from now
      const dueDate = DueDate.of(soonDate);

      expect(dueDate.isSoon()).toBe(true);

      vi.useRealTimers();
    });

    it("should return false for date beyond default 3 days", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const farDate = new Date(now.getTime() + 4 * 86400000); // 4 days from now
      const dueDate = DueDate.of(farDate);

      expect(dueDate.isSoon()).toBe(false);

      vi.useRealTimers();
    });

    it("should return false for overdue date", () => {
      const pastDate = new Date("2020-01-01");
      const dueDate = DueDate.of(pastDate);

      expect(dueDate.isSoon()).toBe(false);
    });

    it("should respect custom threshold", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const date = new Date(now.getTime() + 5 * 86400000); // 5 days from now
      const dueDate = DueDate.of(date);

      expect(dueDate.isSoon(7)).toBe(true); // within 7 days
      expect(dueDate.isSoon(3)).toBe(false); // beyond 3 days

      vi.useRealTimers();
    });
  });

  describe("daysUntilDue", () => {
    it("should return positive days for future date", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const futureDate = new Date(now.getTime() + 5 * 86400000); // 5 days from now
      const dueDate = DueDate.of(futureDate);

      expect(dueDate.daysUntilDue()).toBe(5);

      vi.useRealTimers();
    });

    it("should return negative days for past date", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      const pastDate = new Date(now.getTime() - 3 * 86400000); // 3 days ago
      const dueDate = DueDate.of(pastDate);

      expect(dueDate.daysUntilDue()).toBe(-3);

      vi.useRealTimers();
    });

    it("should round up partial days", () => {
      vi.useFakeTimers();
      const now = new Date("2025-01-01T12:00:00Z");
      vi.setSystemTime(now);

      // 1.5 days from now
      const futureDate = new Date(now.getTime() + 1.5 * 86400000);
      const dueDate = DueDate.of(futureDate);

      expect(dueDate.daysUntilDue()).toBe(2); // rounded up

      vi.useRealTimers();
    });
  });

  describe("equals", () => {
    it("should return true for same date values", () => {
      const date = new Date("2025-12-31");
      const dueDate1 = DueDate.of(date);
      const dueDate2 = DueDate.of(new Date("2025-12-31"));

      expect(dueDate1.equals(dueDate2)).toBe(true);
    });

    it("should return false for different date values", () => {
      const dueDate1 = DueDate.of(new Date("2025-12-31"));
      const dueDate2 = DueDate.of(new Date("2025-12-30"));

      expect(dueDate1.equals(dueDate2)).toBe(false);
    });

    it("should return false for dates differing by milliseconds", () => {
      const date1 = new Date("2025-01-01T12:00:00.000Z");
      const date2 = new Date("2025-01-01T12:00:00.001Z");
      const dueDate1 = DueDate.of(date1);
      const dueDate2 = DueDate.of(date2);

      expect(dueDate1.equals(dueDate2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return ISO string representation", () => {
      const date = new Date("2025-12-31T00:00:00.000Z");
      const dueDate = DueDate.of(date);

      expect(dueDate.toString()).toBe(date.toISOString());
    });
  });

  describe("toJson", () => {
    it("should return ISO string representation", () => {
      const date = new Date("2025-12-31T00:00:00.000Z");
      const dueDate = DueDate.of(date);

      expect(dueDate.toJson()).toBe(date.toISOString());
    });

    it("should match toString output", () => {
      const date = new Date("2025-12-31");
      const dueDate = DueDate.of(date);

      expect(dueDate.toJson()).toBe(dueDate.toString());
    });
  });

  describe("immutability", () => {
    it("should return defensive copy from value getter", () => {
      const dueDate = DueDate.of(new Date("2025-12-31"));
      const value1 = dueDate.value;
      const value2 = dueDate.value;

      // Mutate one copy
      value1.setFullYear(2026);

      // Other copy should not be affected
      expect(value2.getFullYear()).toBe(2025);
      // Original should not be affected
      expect(dueDate.value.getFullYear()).toBe(2025);
    });
  });
});
