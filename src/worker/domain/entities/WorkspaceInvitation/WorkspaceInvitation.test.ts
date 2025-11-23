import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { WorkspaceInvitation } from "./WorkspaceInvitation";
import {
  InvitationId,
  InvitationStatus,
  WorkspaceId,
  UserId,
  EmailAddress,
  RoleId,
} from "../../value-object";

describe("WorkspaceInvitation", () => {
  const validInvitationId = "11111111-1111-4111-8111-111111111111";
  const validWorkspaceId = "22222222-2222-4222-8222-222222222222";
  const validEmail = EmailAddress.of("invitee@example.com");
  const validInvitedBy = "33333333-3333-4333-8333-333333333333";
  const validRoleId = 3;
  const validExpiresAt = new Date("2025-12-31T23:59:59Z");

  describe("of", () => {
    it("有効なWorkspaceInvitationエンティティを作成できること", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(invitation.invitationId.value).toBe(validInvitationId);
      expect(invitation.workspaceId.value).toBe(validWorkspaceId);
      expect(invitation.invitedEmail).toBe(validEmail);
      expect(invitation.invitedBy.value).toBe(validInvitedBy);
      expect(invitation.roleId.value).toBe(validRoleId);
      expect(invitation.status.value).toBe("pending");
      expect(invitation.expiresAt).toBe(validExpiresAt);
    });

    it("無効な招待IDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceInvitation.of(
          InvitationId.of("invalid"),
          WorkspaceId.of(validWorkspaceId),
          validEmail,
          UserId.of(validInvitedBy),
          RoleId.of(validRoleId),
          InvitationStatus.of("pending"),
          validExpiresAt
        )
      ).toThrow();
    });

    it("無効なワークスペースIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceInvitation.of(
          InvitationId.of(validInvitationId),
          WorkspaceId.of("invalid"),
          validEmail,
          UserId.of(validInvitedBy),
          RoleId.of(validRoleId),
          InvitationStatus.of("pending"),
          validExpiresAt
        )
      ).toThrow();
    });

    it("無効なユーザーIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceInvitation.of(
          InvitationId.of(validInvitationId),
          WorkspaceId.of(validWorkspaceId),
          validEmail,
          UserId.of("invalid"),
          RoleId.of(validRoleId),
          InvitationStatus.of("pending"),
          validExpiresAt
        )
      ).toThrow();
    });

    it("無効なロールIDでエラーをスローすること", () => {
      expect(() =>
        WorkspaceInvitation.of(
          InvitationId.of(validInvitationId),
          WorkspaceId.of(validWorkspaceId),
          validEmail,
          UserId.of(validInvitedBy),
          RoleId.of(-1),
          InvitationStatus.of("pending"),
          validExpiresAt
        )
      ).toThrow();
    });
  });

  describe("tryOf", () => {
    it("有効な招待で成功を返すこと", () => {
      const result = WorkspaceInvitation.tryOf(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.invitationId.value).toBe(validInvitationId);
        expect(result.value.workspaceId.value).toBe(validWorkspaceId);
        expect(result.value.invitedEmail).toBe(validEmail);
        expect(result.value.invitedBy.value).toBe(validInvitedBy);
        expect(result.value.roleId.value).toBe(validRoleId);
        expect(result.value.status.value).toBe("pending");
        expect(result.value.expiresAt).toBe(validExpiresAt);
      }
    });

    it("無効な招待でエラーを返すこと", () => {
      expect(() => {
        InvitationId.of("invalid");
      }).toThrow();
    });
  });

  describe("create", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("デフォルトの7日間の有効期限で招待を作成できること", () => {
      const now = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const invitation = WorkspaceInvitation.create(
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId)
      );

      expect(invitation.workspaceId.value).toBe(validWorkspaceId);
      expect(invitation.invitedEmail).toBe(validEmail);
      expect(invitation.invitedBy.value).toBe(validInvitedBy);
      expect(invitation.roleId.value).toBe(validRoleId);
      expect(invitation.status.value).toBe("pending");

      const expectedExpiry = new Date("2024-01-08T00:00:00Z");
      expect(invitation.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });

    it("カスタム有効期限日数で招待を作成できること", () => {
      const now = new Date("2024-01-01T00:00:00Z");
      vi.setSystemTime(now);

      const invitation = WorkspaceInvitation.create(
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        14
      );

      const expectedExpiry = new Date("2024-01-15T00:00:00Z");
      expect(invitation.expiresAt.getTime()).toBe(expectedExpiry.getTime());
    });

    it("招待IDに有効なUUIDを生成できること", () => {
      const invitation = WorkspaceInvitation.create(
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId)
      );

      expect(invitation.invitationId.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
      );
    });
  });

  describe("isExpired", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("期限切れの招待でtrueを返すこと", () => {
      const now = new Date("2024-01-15T00:00:00Z");
      vi.setSystemTime(now);

      const expiredDate = new Date("2024-01-10T00:00:00Z");
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        expiredDate
      );

      expect(invitation.isExpired()).toBe(true);
    });

    it("期限切れでない招待でfalseを返すこと", () => {
      const now = new Date("2024-01-10T00:00:00Z");
      vi.setSystemTime(now);

      const futureDate = new Date("2024-01-15T00:00:00Z");
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        futureDate
      );

      expect(invitation.isExpired()).toBe(false);
    });
  });

  describe("isPending", () => {
    it("保留中の招待でtrueを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(invitation.isPending()).toBe(true);
    });

    it("保留中でない招待でfalseを返すこと", () => {
      const acceptedInvitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("accepted"),
        validExpiresAt
      );

      expect(acceptedInvitation.isPending()).toBe(false);
    });
  });

  describe("isAccepted", () => {
    it("承認された招待でtrueを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("accepted"),
        validExpiresAt
      );

      expect(invitation.isAccepted()).toBe(true);
    });

    it("承認されていない招待でfalseを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(invitation.isAccepted()).toBe(false);
    });
  });

  describe("isRejected", () => {
    it("拒否された招待でtrueを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("rejected"),
        validExpiresAt
      );

      expect(invitation.isRejected()).toBe(true);
    });

    it("拒否されていない招待でfalseを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(invitation.isRejected()).toBe(false);
    });
  });

  describe("canBeAccepted", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("保留中で期限切れでない招待でtrueを返すこと", () => {
      const now = new Date("2024-01-10T00:00:00Z");
      vi.setSystemTime(now);

      const futureDate = new Date("2024-01-15T00:00:00Z");
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        futureDate
      );

      expect(invitation.canBeAccepted()).toBe(true);
    });

    it("期限切れの保留中の招待でfalseを返すこと", () => {
      const now = new Date("2024-01-15T00:00:00Z");
      vi.setSystemTime(now);

      const pastDate = new Date("2024-01-10T00:00:00Z");
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        pastDate
      );

      expect(invitation.canBeAccepted()).toBe(false);
    });

    it("承認された招待でfalseを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("accepted"),
        validExpiresAt
      );

      expect(invitation.canBeAccepted()).toBe(false);
    });
  });

  describe("accept", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("保留中で期限切れでない招待を承認できること", () => {
      const now = new Date("2024-01-10T00:00:00Z");
      vi.setSystemTime(now);

      const futureDate = new Date("2024-01-15T00:00:00Z");
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        futureDate
      );

      const acceptedInvitation = invitation.accept();

      expect(acceptedInvitation.status.value).toBe("accepted");
      expect(acceptedInvitation.invitationId).toBe(invitation.invitationId);
      expect(acceptedInvitation.workspaceId).toBe(invitation.workspaceId);
    });

    it("期限切れの招待を承認しようとした場合にエラーをスローすること", () => {
      const now = new Date("2024-01-15T00:00:00Z");
      vi.setSystemTime(now);

      const pastDate = new Date("2024-01-10T00:00:00Z");
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        pastDate
      );

      expect(() => invitation.accept()).toThrow(
        "Cannot accept invitation: either expired or not pending"
      );
    });

    it("既に承認された招待を承認しようとした場合にエラーをスローすること", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("accepted"),
        validExpiresAt
      );

      expect(() => invitation.accept()).toThrow(
        "Cannot accept invitation: either expired or not pending"
      );
    });
  });

  describe("reject", () => {
    it("保留中の招待を拒否できること", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const rejectedInvitation = invitation.reject();

      expect(rejectedInvitation.status.value).toBe("rejected");
      expect(rejectedInvitation.invitationId).toBe(invitation.invitationId);
      expect(rejectedInvitation.workspaceId).toBe(invitation.workspaceId);
    });

    it("保留中でない招待を拒否しようとした場合にエラーをスローすること", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("accepted"),
        validExpiresAt
      );

      expect(() => invitation.reject()).toThrow(
        "Cannot reject invitation: not pending"
      );
    });
  });

  describe("belongsToWorkspace", () => {
    it("招待がワークスペースに属している場合にtrueを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(
        invitation.belongsToWorkspace(WorkspaceId.of(validWorkspaceId))
      ).toBe(true);
    });

    it("招待がワークスペースに属していない場合にfalseを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const differentWorkspaceId = "44444444-4444-4444-8444-444444444444";
      expect(
        invitation.belongsToWorkspace(WorkspaceId.of(differentWorkspaceId))
      ).toBe(false);
    });
  });

  describe("isForEmail", () => {
    it("招待がそのメールアドレス用の場合にtrueを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      expect(invitation.isForEmail(validEmail)).toBe(true);
    });

    it("招待がそのメールアドレス用でない場合にfalseを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const differentEmail = EmailAddress.of("different@example.com");
      expect(invitation.isForEmail(differentEmail)).toBe(false);
    });
  });

  describe("toJson", () => {
    it("招待をJSONに変換できること", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const json = invitation.toJson();

      expect(json).toEqual({
        invitationId: validInvitationId,
        workspaceId: validWorkspaceId,
        invitedEmail: validEmail.value,
        invitedBy: validInvitedBy,
        roleId: "3",
        status: "pending",
        expiresAt: validExpiresAt.toISOString(),
      });
    });

    it("文字列値を持つプレーンオブジェクトを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const json = invitation.toJson();

      expect(typeof json.invitationId).toBe("string");
      expect(typeof json.workspaceId).toBe("string");
      expect(typeof json.invitedEmail).toBe("string");
      expect(typeof json.invitedBy).toBe("string");
      expect(typeof json.roleId).toBe("string");
      expect(typeof json.status).toBe("string");
      expect(typeof json.expiresAt).toBe("string");
    });
  });

  describe("immutability", () => {
    it("読み取り専用プロパティを持つこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const originalInvitationId = invitation.invitationId;
      const originalWorkspaceId = invitation.workspaceId;
      const originalStatus = invitation.status;

      expect(invitation.invitationId).toBe(originalInvitationId);
      expect(invitation.workspaceId).toBe(originalWorkspaceId);
      expect(invitation.status).toBe(originalStatus);
    });

    it("承認時に新しいインスタンスを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const acceptedInvitation = invitation.accept();

      expect(acceptedInvitation).not.toBe(invitation);
      expect(invitation.status.value).toBe("pending");
      expect(acceptedInvitation.status.value).toBe("accepted");
    });

    it("拒否時に新しいインスタンスを返すこと", () => {
      const invitation = WorkspaceInvitation.of(
        InvitationId.of(validInvitationId),
        WorkspaceId.of(validWorkspaceId),
        validEmail,
        UserId.of(validInvitedBy),
        RoleId.of(validRoleId),
        InvitationStatus.of("pending"),
        validExpiresAt
      );

      const rejectedInvitation = invitation.reject();

      expect(rejectedInvitation).not.toBe(invitation);
      expect(invitation.status.value).toBe("pending");
      expect(rejectedInvitation.status.value).toBe("rejected");
    });
  });
});
