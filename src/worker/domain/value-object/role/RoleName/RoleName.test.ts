import { describe, it, expect } from "vitest";
import { RoleName } from "./RoleName";

describe("RoleName", () => {
  describe("of", () => {
    it("should create RoleName with owner value", () => {
      const roleName = RoleName.of("owner");

      expect(roleName.value).toBe("owner");
      expect(roleName.isOwner()).toBe(true);
    });

    it("should create RoleName with admin value", () => {
      const roleName = RoleName.of("admin");

      expect(roleName.value).toBe("admin");
      expect(roleName.isAdmin()).toBe(true);
    });

    it("should create RoleName with member value", () => {
      const roleName = RoleName.of("member");

      expect(roleName.value).toBe("member");
      expect(roleName.isMember()).toBe(true);
    });

    it("should create RoleName with guest value", () => {
      const roleName = RoleName.of("guest");

      expect(roleName.value).toBe("guest");
      expect(roleName.isGuest()).toBe(true);
    });
  });

  describe("factory methods", () => {
    it("should create owner role", () => {
      const roleName = RoleName.owner();

      expect(roleName.value).toBe("owner");
      expect(roleName.isOwner()).toBe(true);
    });

    it("should create admin role", () => {
      const roleName = RoleName.admin();

      expect(roleName.value).toBe("admin");
      expect(roleName.isAdmin()).toBe(true);
    });

    it("should create member role", () => {
      const roleName = RoleName.member();

      expect(roleName.value).toBe("member");
      expect(roleName.isMember()).toBe(true);
    });

    it("should create guest role", () => {
      const roleName = RoleName.guest();

      expect(roleName.value).toBe("guest");
      expect(roleName.isGuest()).toBe(true);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid role name", () => {
      const result = RoleName.tryOf("owner");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("owner");
      }
    });

    it("should return success for all valid role names", () => {
      expect(RoleName.tryOf("owner").success).toBe(true);
      expect(RoleName.tryOf("admin").success).toBe(true);
      expect(RoleName.tryOf("member").success).toBe(true);
      expect(RoleName.tryOf("guest").success).toBe(true);
    });

    it("should return error for invalid role name", () => {
      const result = RoleName.tryOf("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for empty string", () => {
      const result = RoleName.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("role check methods", () => {
    it("isOwner should return true only for owner role", () => {
      expect(RoleName.owner().isOwner()).toBe(true);
      expect(RoleName.admin().isOwner()).toBe(false);
      expect(RoleName.member().isOwner()).toBe(false);
      expect(RoleName.guest().isOwner()).toBe(false);
    });

    it("isAdmin should return true only for admin role", () => {
      expect(RoleName.owner().isAdmin()).toBe(false);
      expect(RoleName.admin().isAdmin()).toBe(true);
      expect(RoleName.member().isAdmin()).toBe(false);
      expect(RoleName.guest().isAdmin()).toBe(false);
    });

    it("isMember should return true only for member role", () => {
      expect(RoleName.owner().isMember()).toBe(false);
      expect(RoleName.admin().isMember()).toBe(false);
      expect(RoleName.member().isMember()).toBe(true);
      expect(RoleName.guest().isMember()).toBe(false);
    });

    it("isGuest should return true only for guest role", () => {
      expect(RoleName.owner().isGuest()).toBe(false);
      expect(RoleName.admin().isGuest()).toBe(false);
      expect(RoleName.member().isGuest()).toBe(false);
      expect(RoleName.guest().isGuest()).toBe(true);
    });
  });

  describe("canManageWorkspace", () => {
    it("should return true for owner", () => {
      expect(RoleName.owner().canManageWorkspace()).toBe(true);
    });

    it("should return true for admin", () => {
      expect(RoleName.admin().canManageWorkspace()).toBe(true);
    });

    it("should return false for member", () => {
      expect(RoleName.member().canManageWorkspace()).toBe(false);
    });

    it("should return false for guest", () => {
      expect(RoleName.guest().canManageWorkspace()).toBe(false);
    });
  });

  describe("canEditBoard", () => {
    it("should return true for owner", () => {
      expect(RoleName.owner().canEditBoard()).toBe(true);
    });

    it("should return true for admin", () => {
      expect(RoleName.admin().canEditBoard()).toBe(true);
    });

    it("should return true for member", () => {
      expect(RoleName.member().canEditBoard()).toBe(true);
    });

    it("should return false for guest", () => {
      expect(RoleName.guest().canEditBoard()).toBe(false);
    });
  });

  describe("equals", () => {
    it("should return true for same role values", () => {
      const roleName1 = RoleName.owner();
      const roleName2 = RoleName.of("owner");

      expect(roleName1.equals(roleName2)).toBe(true);
    });

    it("should return false for different role values", () => {
      const roleName1 = RoleName.owner();
      const roleName2 = RoleName.admin();

      expect(roleName1.equals(roleName2)).toBe(false);
    });

    it("should work for all role combinations", () => {
      const owner = RoleName.owner();
      const admin = RoleName.admin();
      const member = RoleName.member();
      const guest = RoleName.guest();

      expect(owner.equals(owner)).toBe(true);
      expect(owner.equals(admin)).toBe(false);
      expect(admin.equals(member)).toBe(false);
      expect(member.equals(guest)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return role name as string", () => {
      expect(RoleName.owner().toString()).toBe("owner");
      expect(RoleName.admin().toString()).toBe("admin");
      expect(RoleName.member().toString()).toBe("member");
      expect(RoleName.guest().toString()).toBe("guest");
    });
  });
});
