import { describe, it, expect } from "vitest";
import { WorkspaceMembership } from "./WorkspaceMembership";
import { MembershipId, WorkspaceId, UserId, RoleId } from "../../value-object";

describe("WorkspaceMembership", () => {
  const validMembershipId = "11111111-1111-4111-8111-111111111111";
  const validWorkspaceId = "22222222-2222-4222-8222-222222222222";
  const validUserId = "33333333-3333-4333-8333-333333333333";
  const validRoleId = 1;

  describe("of", () => {
    it("有効なWorkspaceMembershipエンティティを作成できること", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      expect(membership.membershipId.value).toBe(validMembershipId);
      expect(membership.workspaceId.value).toBe(validWorkspaceId);
      expect(membership.userId.value).toBe(validUserId);
      expect(membership.roleId.value).toBe(validRoleId);
    });

    it("無効なメンバーシップIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceMembership.of(
          MembershipId.of("invalid"),
          WorkspaceId.of(validWorkspaceId),
          UserId.of(validUserId),
          RoleId.of(validRoleId)
        )
      ).toThrow();
    });

    it("無効なワークスペースIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceMembership.of(
          MembershipId.of(validMembershipId),
          WorkspaceId.of("invalid"),
          UserId.of(validUserId),
          RoleId.of(validRoleId)
        )
      ).toThrow();
    });

    it("無効なユーザーIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceMembership.of(
          MembershipId.of(validMembershipId),
          WorkspaceId.of(validWorkspaceId),
          UserId.of("invalid"),
          RoleId.of(validRoleId)
        )
      ).toThrow();
    });

    it("無効なロールIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceMembership.of(
          MembershipId.of(validMembershipId),
          WorkspaceId.of(validWorkspaceId),
          UserId.of(validUserId),
          RoleId.of(-1)
        )
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効なメンバーシップで成功を返すこと", () => {
      const result = WorkspaceMembership.tryOf(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.membershipId.value).toBe(validMembershipId);
        expect(result.value.workspaceId.value).toBe(validWorkspaceId);
        expect(result.value.userId.value).toBe(validUserId);
        expect(result.value.roleId.value).toBe(validRoleId);
      }
    });

    it("無効なメンバーシップでエラーを返すこと", () => {
      expect(() => {
        MembershipId.of("invalid");
      }).toThrow();
    });
  });

  describe("createOwnerMembership", () => {
    it("生成されたIDでオーナーメンバーシップを作成できること", () => {
      const membership = WorkspaceMembership.createOwnerMembership(
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId)
      );

      expect(membership.workspaceId.value).toBe(validWorkspaceId);
      expect(membership.userId.value).toBe(validUserId);
      expect(membership.roleId).toBe(RoleId.OWNER);
      expect(membership.membershipId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("一意のメンバーシップIDを生成できること", () => {
      const membership1 = WorkspaceMembership.createOwnerMembership(
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId)
      );

      const membership2 = WorkspaceMembership.createOwnerMembership(
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId)
      );

      expect(membership1.membershipId.value).not.toBe(
        membership2.membershipId.value
      );
    });
  });

  describe("createMembership", () => {
    it("生成されたIDと指定されたロールでメンバーシップを作成できること", () => {
      const membership = WorkspaceMembership.createMembership(
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(3)
      );

      expect(membership.workspaceId.value).toBe(validWorkspaceId);
      expect(membership.userId.value).toBe(validUserId);
      expect(membership.roleId.value).toBe(3);
      expect(membership.membershipId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });

    it("一意のメンバーシップIDを生成できること", () => {
      const membership1 = WorkspaceMembership.createMembership(
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(3)
      );

      const membership2 = WorkspaceMembership.createMembership(
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(3)
      );

      expect(membership1.membershipId.value).not.toBe(
        membership2.membershipId.value
      );
    });
  });

  describe("belongsToWorkspace", () => {
    it("メンバーシップがワークスペースに属している場合にtrueを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      expect(
        membership.belongsToWorkspace(WorkspaceId.of(validWorkspaceId))
      ).toBe(true);
    });

    it("メンバーシップがワークスペースに属していない場合にfalseを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      const differentWorkspaceId = "44444444-4444-4444-8444-444444444444";
      expect(
        membership.belongsToWorkspace(WorkspaceId.of(differentWorkspaceId))
      ).toBe(false);
    });
  });

  describe("isUser", () => {
    it("メンバーシップがそのユーザー用の場合にtrueを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      expect(membership.isUser(UserId.of(validUserId))).toBe(true);
    });

    it("メンバーシップがそのユーザー用でない場合にfalseを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      const differentUserId = "44444444-4444-4444-8444-444444444444";
      expect(membership.isUser(UserId.of(differentUserId))).toBe(false);
    });
  });

  describe("hasRole", () => {
    it("メンバーシップがそのロールを持つ場合にtrueを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      expect(membership.hasRole(RoleId.of(validRoleId))).toBe(true);
    });

    it("メンバーシップがそのロールを持たない場合にfalseを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      expect(membership.hasRole(RoleId.of(3))).toBe(false);
    });
  });

  describe("toJson", () => {
    it("メンバーシップをJSONに変換できること", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      const json = membership.toJson();

      expect(json).toEqual({
        membershipId: validMembershipId,
        workspaceId: validWorkspaceId,
        userId: validUserId,
        roleId: "1",
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      const json = membership.toJson();

      expect(typeof json.membershipId).toBe("string");
      expect(typeof json.workspaceId).toBe("string");
      expect(typeof json.userId).toBe("string");
      expect(typeof json.roleId).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const membership = WorkspaceMembership.of(
        MembershipId.of(validMembershipId),
        WorkspaceId.of(validWorkspaceId),
        UserId.of(validUserId),
        RoleId.of(validRoleId)
      );

      const originalMembershipId = membership.membershipId;
      const originalWorkspaceId = membership.workspaceId;
      const originalUserId = membership.userId;
      const originalRoleId = membership.roleId;

      expect(membership.membershipId).toBe(originalMembershipId);
      expect(membership.workspaceId).toBe(originalWorkspaceId);
      expect(membership.userId).toBe(originalUserId);
      expect(membership.roleId).toBe(originalRoleId);
    });
  });
});
