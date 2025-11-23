import { describe, it, expect } from "vitest";
import { RoleId } from "./RoleId";

describe("RoleId", () => {
  describe("of", () => {
    it("should create a valid RoleId from positive integer", () => {
      const roleId = RoleId.of(1);

      expect(roleId.value).toBe(1);
      expect(roleId.toString()).toBe("1");
    });

    it("should accept large positive integer", () => {
      const roleId = RoleId.of(999);

      expect(roleId.value).toBe(999);
    });

    it("should throw error for zero", () => {
      expect(() => RoleId.of(0)).toThrow();
    });

    it("should throw error for negative integer", () => {
      expect(() => RoleId.of(-1)).toThrow();
    });

    it("should throw error for decimal number", () => {
      expect(() => RoleId.of(1.5)).toThrow();
    });
  });

  describe("predefined role constants", () => {
    it("should have OWNER constant with value 1", () => {
      expect(RoleId.OWNER.value).toBe(1);
    });

    it("should have ADMIN constant with value 2", () => {
      expect(RoleId.ADMIN.value).toBe(2);
    });

    it("should have MEMBER constant with value 3", () => {
      expect(RoleId.MEMBER.value).toBe(3);
    });

    it("should return same instance for constants", () => {
      const owner1 = RoleId.OWNER;
      const owner2 = RoleId.OWNER;

      expect(owner1).toBe(owner2);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid positive integer", () => {
      const result = RoleId.tryOf(5);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe(5);
      }
    });

    it("should return error for zero", () => {
      const result = RoleId.tryOf(0);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for negative integer", () => {
      const result = RoleId.tryOf(-5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for decimal number", () => {
      const result = RoleId.tryOf(2.5);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("equals", () => {
    it("should return true for same role ID values", () => {
      const roleId1 = RoleId.of(5);
      const roleId2 = RoleId.of(5);

      expect(roleId1.equals(roleId2)).toBe(true);
    });

    it("should return false for different role ID values", () => {
      const roleId1 = RoleId.of(1);
      const roleId2 = RoleId.of(2);

      expect(roleId1.equals(roleId2)).toBe(false);
    });

    it("should work with predefined constants", () => {
      const owner = RoleId.OWNER;
      const admin = RoleId.ADMIN;

      expect(owner.equals(admin)).toBe(false);
      expect(owner.equals(RoleId.OWNER)).toBe(true);
    });

    it("should equal constant when created with same value", () => {
      const roleId = RoleId.of(1);
      expect(roleId.equals(RoleId.OWNER)).toBe(true);
    });
  });

  describe("toString", () => {
    it("should return role ID as string", () => {
      const roleId = RoleId.of(42);

      expect(roleId.toString()).toBe("42");
    });

    it("should return string representation for all predefined roles", () => {
      expect(RoleId.OWNER.toString()).toBe("1");
      expect(RoleId.ADMIN.toString()).toBe("2");
      expect(RoleId.MEMBER.toString()).toBe("3");
    });
  });
});
