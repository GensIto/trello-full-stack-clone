import { describe, it, expect } from "vitest";
import { Role } from "./Role";
import { RoleId, RoleName } from "../../value-object";

describe("Role", () => {
  const validRoleId = 1;
  const validRoleName = RoleName.owner();

  describe("of", () => {
    it("有効なRoleエンティティを作成できること", () => {
      const role = Role.of(RoleId.of(validRoleId), validRoleName);

      expect(role.roleId.value).toBe(validRoleId);
      expect(role.name.value).toBe("owner");
    });

    it("異なるロール名でロールを作成できること", () => {
      const ownerRole = Role.of(RoleId.of(1), RoleName.owner());
      expect(ownerRole.name.value).toBe("owner");

      const adminRole = Role.of(RoleId.of(2), RoleName.admin());
      expect(adminRole.name.value).toBe("admin");

      const memberRole = Role.of(RoleId.of(3), RoleName.member());
      expect(memberRole.name.value).toBe("member");

      const guestRole = Role.of(RoleId.of(4), RoleName.guest());
      expect(guestRole.name.value).toBe("guest");
    });

    it("無効なロールIDでエラーをスローすること", () => {
      expect(() => Role.of(RoleId.of(-1), validRoleName)).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なロールで成功を返すこと", () => {
      const result = Role.tryOf(RoleId.of(validRoleId), validRoleName);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.roleId.value).toBe(validRoleId);
        expect(result.value.name.value).toBe("owner");
      }
    });

    it("無効なロールでエラーを返すこと", () => {
      expect(() => {
        RoleId.of(-1);
      }).toThrow();
    });
  });

  describe("isOwner", () => {
    it("オーナーロールでtrueを返すこと", () => {
      const role = Role.of(RoleId.of(1), RoleName.owner());

      expect(role.isOwner()).toBe(true);
    });

    it("オーナー以外のロールでfalseを返すこと", () => {
      const adminRole = Role.of(RoleId.of(2), RoleName.admin());
      expect(adminRole.isOwner()).toBe(false);

      const memberRole = Role.of(RoleId.of(3), RoleName.member());
      expect(memberRole.isOwner()).toBe(false);

      const guestRole = Role.of(RoleId.of(4), RoleName.guest());
      expect(guestRole.isOwner()).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("管理者ロールでtrueを返すこと", () => {
      const role = Role.of(RoleId.of(2), RoleName.admin());

      expect(role.isAdmin()).toBe(true);
    });

    it("管理者以外のロールでfalseを返すこと", () => {
      const ownerRole = Role.of(RoleId.of(1), RoleName.owner());
      expect(ownerRole.isAdmin()).toBe(false);

      const memberRole = Role.of(RoleId.of(3), RoleName.member());
      expect(memberRole.isAdmin()).toBe(false);

      const guestRole = Role.of(RoleId.of(4), RoleName.guest());
      expect(guestRole.isAdmin()).toBe(false);
    });
  });

  describe("isMember", () => {
    it("メンバーロールでtrueを返すこと", () => {
      const role = Role.of(RoleId.of(3), RoleName.member());

      expect(role.isMember()).toBe(true);
    });

    it("メンバー以外のロールでfalseを返すこと", () => {
      const ownerRole = Role.of(RoleId.of(1), RoleName.owner());
      expect(ownerRole.isMember()).toBe(false);

      const adminRole = Role.of(RoleId.of(2), RoleName.admin());
      expect(adminRole.isMember()).toBe(false);

      const guestRole = Role.of(RoleId.of(4), RoleName.guest());
      expect(guestRole.isMember()).toBe(false);
    });
  });

  describe("isGuest", () => {
    it("ゲストロールでtrueを返すこと", () => {
      const role = Role.of(RoleId.of(4), RoleName.guest());

      expect(role.isGuest()).toBe(true);
    });

    it("ゲスト以外のロールでfalseを返すこと", () => {
      const ownerRole = Role.of(RoleId.of(1), RoleName.owner());
      expect(ownerRole.isGuest()).toBe(false);

      const adminRole = Role.of(RoleId.of(2), RoleName.admin());
      expect(adminRole.isGuest()).toBe(false);

      const memberRole = Role.of(RoleId.of(3), RoleName.member());
      expect(memberRole.isGuest()).toBe(false);
    });
  });

  describe("canManageWorkspace", () => {
    it("オーナーと管理者ロールでtrueを返すこと", () => {
      const ownerRole = Role.of(RoleId.of(1), RoleName.owner());
      expect(ownerRole.canManageWorkspace()).toBe(true);

      const adminRole = Role.of(RoleId.of(2), RoleName.admin());
      expect(adminRole.canManageWorkspace()).toBe(true);
    });

    it("メンバーとゲストロールでfalseを返すこと", () => {
      const memberRole = Role.of(RoleId.of(3), RoleName.member());
      expect(memberRole.canManageWorkspace()).toBe(false);

      const guestRole = Role.of(RoleId.of(4), RoleName.guest());
      expect(guestRole.canManageWorkspace()).toBe(false);
    });
  });

  describe("canEditBoard", () => {
    it("オーナー、管理者、メンバーロールでtrueを返すこと", () => {
      const ownerRole = Role.of(RoleId.of(1), RoleName.owner());
      expect(ownerRole.canEditBoard()).toBe(true);

      const adminRole = Role.of(RoleId.of(2), RoleName.admin());
      expect(adminRole.canEditBoard()).toBe(true);

      const memberRole = Role.of(RoleId.of(3), RoleName.member());
      expect(memberRole.canEditBoard()).toBe(true);
    });

    it("ゲストロールでfalseを返すこと", () => {
      const guestRole = Role.of(RoleId.of(4), RoleName.guest());
      expect(guestRole.canEditBoard()).toBe(false);
    });
  });

  describe("toJson", () => {
    it("ロールをJSONに変換できること", () => {
      const role = Role.of(RoleId.of(validRoleId), validRoleName);

      const json = role.toJson();

      expect(json).toEqual({
        roleId: "1",
        name: "owner",
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const role = Role.of(RoleId.of(validRoleId), validRoleName);

      const json = role.toJson();

      expect(typeof json.roleId).toBe("string");
      expect(typeof json.name).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const role = Role.of(RoleId.of(validRoleId), validRoleName);

      const originalRoleId = role.roleId;
      const originalName = role.name;

      expect(role.roleId).toBe(originalRoleId);
      expect(role.name).toBe(originalName);
    });
  });
});
