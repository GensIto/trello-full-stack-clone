import { describe, it, expect } from "vitest";
import { InvitationStatus } from "./InvitationStatus";

describe("InvitationStatus", () => {
  describe("of", () => {
    it("should create InvitationStatus with pending value", () => {
      const status = InvitationStatus.of("pending");

      expect(status.value).toBe("pending");
      expect(status.isPending()).toBe(true);
    });

    it("should create InvitationStatus with accepted value", () => {
      const status = InvitationStatus.of("accepted");

      expect(status.value).toBe("accepted");
      expect(status.isAccepted()).toBe(true);
    });

    it("should create InvitationStatus with rejected value", () => {
      const status = InvitationStatus.of("rejected");

      expect(status.value).toBe("rejected");
      expect(status.isRejected()).toBe(true);
    });
  });

  describe("tryOf", () => {
    it("should return success for valid pending status", () => {
      const result = InvitationStatus.tryOf("pending");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("pending");
        expect(result.value.isPending()).toBe(true);
      }
    });

    it("should return success for valid accepted status", () => {
      const result = InvitationStatus.tryOf("accepted");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("accepted");
        expect(result.value.isAccepted()).toBe(true);
      }
    });

    it("should return success for valid rejected status", () => {
      const result = InvitationStatus.tryOf("rejected");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.value).toBe("rejected");
        expect(result.value.isRejected()).toBe(true);
      }
    });

    it("should return error for invalid status", () => {
      const result = InvitationStatus.tryOf("invalid");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for empty string", () => {
      const result = InvitationStatus.tryOf("");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it("should return error for case-sensitive mismatch", () => {
      const result = InvitationStatus.tryOf("Pending");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("status check methods", () => {
    it("isPending should return true only for pending status", () => {
      expect(InvitationStatus.of("pending").isPending()).toBe(true);
      expect(InvitationStatus.of("accepted").isPending()).toBe(false);
      expect(InvitationStatus.of("rejected").isPending()).toBe(false);
    });

    it("isAccepted should return true only for accepted status", () => {
      expect(InvitationStatus.of("pending").isAccepted()).toBe(false);
      expect(InvitationStatus.of("accepted").isAccepted()).toBe(true);
      expect(InvitationStatus.of("rejected").isAccepted()).toBe(false);
    });

    it("isRejected should return true only for rejected status", () => {
      expect(InvitationStatus.of("pending").isRejected()).toBe(false);
      expect(InvitationStatus.of("accepted").isRejected()).toBe(false);
      expect(InvitationStatus.of("rejected").isRejected()).toBe(true);
    });
  });

  describe("equals", () => {
    it("should return true for same status values", () => {
      const status1 = InvitationStatus.of("pending");
      const status2 = InvitationStatus.of("pending");

      expect(status1.equals(status2)).toBe(true);
    });

    it("should return false for different status values", () => {
      const status1 = InvitationStatus.of("pending");
      const status2 = InvitationStatus.of("accepted");

      expect(status1.equals(status2)).toBe(false);
    });

    it("should work for all status combinations", () => {
      const pending = InvitationStatus.of("pending");
      const accepted = InvitationStatus.of("accepted");
      const rejected = InvitationStatus.of("rejected");

      expect(pending.equals(pending)).toBe(true);
      expect(pending.equals(accepted)).toBe(false);
      expect(accepted.equals(rejected)).toBe(false);
      expect(rejected.equals(pending)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return status value as string", () => {
      expect(InvitationStatus.of("pending").toString()).toBe("pending");
      expect(InvitationStatus.of("accepted").toString()).toBe("accepted");
      expect(InvitationStatus.of("rejected").toString()).toBe("rejected");
    });
  });
});
