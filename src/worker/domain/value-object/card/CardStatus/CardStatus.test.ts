import { describe, it, expect } from "vitest";
import { CardStatus } from "./CardStatus";

describe("CardStatus", () => {
  describe("of", () => {
    it("should create CardStatus with todo value", () => {
      const status = CardStatus.of("todo");

      expect(status.value).toBe("todo");
      expect(status.isTodo()).toBe(true);
    });

    it("should create CardStatus with in_progress value", () => {
      const status = CardStatus.of("in_progress");

      expect(status.value).toBe("in_progress");
      expect(status.isInProgress()).toBe(true);
    });

    it("should create CardStatus with done value", () => {
      const status = CardStatus.of("done");

      expect(status.value).toBe("done");
      expect(status.isDone()).toBe(true);
    });
  });

  describe("factory methods", () => {
    it("should create todo status", () => {
      const status = CardStatus.todo();

      expect(status.value).toBe("todo");
      expect(status.isTodo()).toBe(true);
    });

    it("should create inProgress status", () => {
      const status = CardStatus.inProgress();

      expect(status.value).toBe("in_progress");
      expect(status.isInProgress()).toBe(true);
    });

    it("should create done status", () => {
      const status = CardStatus.done();

      expect(status.value).toBe("done");
      expect(status.isDone()).toBe(true);
    });
  });

  describe("status check methods", () => {
    it("isTodo should return true only for todo status", () => {
      expect(CardStatus.todo().isTodo()).toBe(true);
      expect(CardStatus.inProgress().isTodo()).toBe(false);
      expect(CardStatus.done().isTodo()).toBe(false);
    });

    it("isInProgress should return true only for in_progress status", () => {
      expect(CardStatus.todo().isInProgress()).toBe(false);
      expect(CardStatus.inProgress().isInProgress()).toBe(true);
      expect(CardStatus.done().isInProgress()).toBe(false);
    });

    it("isDone should return true only for done status", () => {
      expect(CardStatus.todo().isDone()).toBe(false);
      expect(CardStatus.inProgress().isDone()).toBe(false);
      expect(CardStatus.done().isDone()).toBe(true);
    });
  });

  describe("equals", () => {
    it("should return true for same status values", () => {
      const status1 = CardStatus.todo();
      const status2 = CardStatus.of("todo");

      expect(status1.equals(status2)).toBe(true);
    });

    it("should return false for different status values", () => {
      const status1 = CardStatus.todo();
      const status2 = CardStatus.done();

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe("toString", () => {
    it("should return status value as string", () => {
      expect(CardStatus.todo().toString()).toBe("todo");
      expect(CardStatus.inProgress().toString()).toBe("in_progress");
      expect(CardStatus.done().toString()).toBe("done");
    });
  });

  describe("toJson", () => {
    it("should return JSON representation", () => {
      const status = CardStatus.todo();
      const json = status.toJson();

      expect(json).toEqual({ value: "todo" });
    });

    it("should return JSON for all statuses", () => {
      expect(CardStatus.todo().toJson()).toEqual({ value: "todo" });
      expect(CardStatus.inProgress().toJson()).toEqual({ value: "in_progress" });
      expect(CardStatus.done().toJson()).toEqual({ value: "done" });
    });
  });

  describe("canTransitionTo", () => {
    describe("from todo", () => {
      const todoStatus = CardStatus.todo();

      it("should allow transition to in_progress", () => {
        expect(todoStatus.canTransitionTo(CardStatus.inProgress())).toBe(true);
      });

      it("should allow transition to done", () => {
        expect(todoStatus.canTransitionTo(CardStatus.done())).toBe(true);
      });

      it("should not allow transition to todo", () => {
        expect(todoStatus.canTransitionTo(CardStatus.todo())).toBe(false);
      });
    });

    describe("from in_progress", () => {
      const inProgressStatus = CardStatus.inProgress();

      it("should allow transition to done", () => {
        expect(inProgressStatus.canTransitionTo(CardStatus.done())).toBe(true);
      });

      it("should allow transition to todo", () => {
        expect(inProgressStatus.canTransitionTo(CardStatus.todo())).toBe(true);
      });

      it("should not allow transition to in_progress", () => {
        expect(inProgressStatus.canTransitionTo(CardStatus.inProgress())).toBe(false);
      });
    });

    describe("from done", () => {
      const doneStatus = CardStatus.done();

      it("should allow transition to in_progress", () => {
        expect(doneStatus.canTransitionTo(CardStatus.inProgress())).toBe(true);
      });

      it("should not allow transition to todo", () => {
        expect(doneStatus.canTransitionTo(CardStatus.todo())).toBe(false);
      });

      it("should not allow transition to done", () => {
        expect(doneStatus.canTransitionTo(CardStatus.done())).toBe(false);
      });
    });
  });

  describe("getTransitionErrorMessage", () => {
    it("should return error message for invalid transition", () => {
      const todoStatus = CardStatus.todo();
      const message = todoStatus.getTransitionErrorMessage(CardStatus.todo());

      expect(message).toBe("Cannot transition from todo to todo");
    });

    it("should return error message for all invalid transitions", () => {
      const doneStatus = CardStatus.done();
      const message = doneStatus.getTransitionErrorMessage(CardStatus.todo());

      expect(message).toBe("Cannot transition from done to todo");
    });
  });
});
