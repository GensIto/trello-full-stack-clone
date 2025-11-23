import { describe, it, expect } from "vitest";
import { WorkspaceId } from "./WorkspaceId";

describe("WorkspaceId", () => {
  describe("of", () => {
    it("should create a valid WorkspaceId from UUID string", () => {
      const uuid = "11111111-1111-4111-8111-111111111111";
      const workspaceId = WorkspaceId.of(uuid);

      expect(workspaceId.value).toBe(uuid);
      expect(workspaceId.toString()).toBe(uuid);
    });

    it("should throw error for invalid UUID format", () => {
      expect(() => WorkspaceId.of("invalid-uuid")).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => WorkspaceId.of("")).toThrow();
    });

    it("should throw error for non-UUID string", () => {
      expect(() => WorkspaceId.of("not-a-uuid")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("should return success for valid UUID", () => {
      const uuid = "22222222-2222-4222-8222-222222222222";
      const result = WorkspaceId.tryOf(uuid);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(uuid);
      }
    });

    it("should return error for invalid UUID", () => {
      const result = WorkspaceId.tryOf("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same UUID values", () => {
      const uuid = "33333333-3333-4333-8333-333333333333";
      const id1 = WorkspaceId.of(uuid);
      const id2 = WorkspaceId.of(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different UUID values", () => {
      const id1 = WorkspaceId.of("11111111-1111-4111-8111-111111111111");
      const id2 = WorkspaceId.of("22222222-2222-4222-8222-222222222222");

      expect(id1.equals(id2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return the UUID string", () => {
      const uuid = "44444444-4444-4444-8444-444444444444";
      const workspaceId = WorkspaceId.of(uuid);

      expect(workspaceId.toString()).toBe(uuid);
    });
  });
});
