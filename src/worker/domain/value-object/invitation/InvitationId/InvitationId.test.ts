import { describe, it, expect } from "vitest";
import { InvitationId } from "./InvitationId";

describe("InvitationId", () => {
  describe("of", () => {
    it("should create a valid InvitationId from UUID string", () => {
      const uuid = "11111111-1111-4111-8111-111111111111";
      const invitationId = InvitationId.of(uuid);

      expect(invitationId.value).toBe(uuid);
      expect(invitationId.toString()).toBe(uuid);
    });

    it("should accept valid UUID v4", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const invitationId = InvitationId.of(uuid);

      expect(invitationId.value).toBe(uuid);
    });

    it("should throw error for invalid UUID format", () => {
      expect(() => InvitationId.of("invalid-uuid")).toThrow();
    });

    it("should throw error for empty string", () => {
      expect(() => InvitationId.of("")).toThrow();
    });

    it("should throw error for non-UUID string", () => {
      expect(() => InvitationId.of("not-a-uuid")).toThrow();
    });

    it("should throw error for UUID without hyphens", () => {
      expect(() => InvitationId.of("11111111111141118111111111111111")).toThrow();
    });
  });

  describe("tryOf", () => {
    it("should return success for valid UUID", () => {
      const uuid = "22222222-2222-4222-8222-222222222222";
      const result = InvitationId.tryOf(uuid);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(uuid);
      }
    });

    it("should return error for invalid UUID", () => {
      const result = InvitationId.tryOf("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for empty string", () => {
      const result = InvitationId.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for malformed UUID", () => {
      const result = InvitationId.tryOf("123-456-789");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same UUID values", () => {
      const uuid = "33333333-3333-4333-8333-333333333333";
      const id1 = InvitationId.of(uuid);
      const id2 = InvitationId.of(uuid);

      expect(id1.equals(id2)).toBe(true);
    });

    it("should return false for different UUID values", () => {
      const id1 = InvitationId.of("11111111-1111-4111-8111-111111111111");
      const id2 = InvitationId.of("22222222-2222-4222-8222-222222222222");

      expect(id1.equals(id2)).toBe(false);
    });

    it("should be case-sensitive for UUID comparison", () => {
      const id1 = InvitationId.of("11111111-1111-4111-8111-111111111111");
      const id2 = InvitationId.of("11111111-1111-4111-8111-111111111111");

      expect(id1.equals(id2)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return the UUID string", () => {
      const uuid = "44444444-4444-4444-8444-444444444444";
      const invitationId = InvitationId.of(uuid);

      expect(invitationId.toString()).toBe(uuid);
    });

    it("should preserve UUID format", () => {
      const uuid = "a1b2c3d4-e5f6-4789-a012-b3c4d5e6f789";
      const invitationId = InvitationId.of(uuid);

      expect(invitationId.toString()).toBe(uuid);
    });
  });
});
