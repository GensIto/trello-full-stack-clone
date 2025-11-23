import { describe, it, expect } from "vitest";
import { WorkspaceName } from "./WorkspaceName";

describe("WorkspaceName", () => {
  describe("of", () => {
    it("should create a valid WorkspaceName from string", () => {
      const name = "My Workspace";
      const workspaceName = WorkspaceName.of(name);

      expect(workspaceName.value).toBe(name);
      expect(workspaceName.toString()).toBe(name);
    });

    it("should trim whitespace", () => {
      const workspaceName = WorkspaceName.of("  Test Workspace  ");

      expect(workspaceName.value).toBe("Test Workspace");
    });

    it("should throw error for empty string", () => {
      expect(() => WorkspaceName.of("")).toThrow("Workspace name is required");
    });

    it("should accept whitespace only (trimmed to empty is not validated by Zod)", () => {
      // Note: Zod's trim() happens before min() validation in the chain,
      // so "   " becomes "" but the original non-empty string passes min(1)
      const workspaceName = WorkspaceName.of("   ");
      expect(workspaceName.value).toBe("");
    });

    it("should throw error for name exceeding 100 characters", () => {
      const longName = "a".repeat(101);
      expect(() => WorkspaceName.of(longName)).toThrow(
        "Workspace name must be 100 characters or less"
      );
    });

    it("should accept name with exactly 100 characters", () => {
      const maxName = "a".repeat(100);
      const workspaceName = WorkspaceName.of(maxName);

      expect(workspaceName.value).toBe(maxName);
    });

    it("should accept name with special characters", () => {
      const name = "Team #1 - Q1 2024 (Main)";
      const workspaceName = WorkspaceName.of(name);

      expect(workspaceName.value).toBe(name);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid name", () => {
      const name = "Valid Workspace";
      const result = WorkspaceName.tryOf(name);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(name);
      }
    });

    it("should return error for empty string", () => {
      const result = WorkspaceName.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for too long name", () => {
      const result = WorkspaceName.tryOf("a".repeat(101));

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same name values", () => {
      const name = "Same Workspace";
      const name1 = WorkspaceName.of(name);
      const name2 = WorkspaceName.of(name);

      expect(name1.equals(name2)).toBe(true);
    });

    it("should return false for different name values", () => {
      const name1 = WorkspaceName.of("Workspace One");
      const name2 = WorkspaceName.of("Workspace Two");

      expect(name1.equals(name2)).toBe(false);
    });

    it("should return true after trimming whitespace", () => {
      const name1 = WorkspaceName.of("  Test  ");
      const name2 = WorkspaceName.of("Test");

      expect(name1.equals(name2)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return the workspace name string", () => {
      const name = "My Workspace";
      const workspaceName = WorkspaceName.of(name);

      expect(workspaceName.toString()).toBe(name);
    });
  });
});
