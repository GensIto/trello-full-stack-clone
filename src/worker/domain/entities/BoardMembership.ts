import { z } from "zod";
import { BoardId, MembershipId } from "../value-object";

const boardMembershipIdSchema = z.uuid("Invalid board membership ID format");

export class BoardMembershipId {
  private constructor(private readonly _value: string) {}

  static of(value: string): BoardMembershipId {
    const validated = boardMembershipIdSchema.parse(value);
    return new BoardMembershipId(validated);
  }

  get value(): string {
    return this._value;
  }

  equals(other: BoardMembershipId): boolean {
    return this._value === other._value;
  }

  toString(): string {
    return this._value;
  }
}

const boardMembershipSchema = z.object({
  boardMembershipId: z.custom<BoardMembershipId>(
    (val) => val instanceof BoardMembershipId,
    "Invalid board membership ID"
  ),
  boardId: z.custom<BoardId>(
    (val) => val instanceof BoardId,
    "Invalid board ID"
  ),
  membershipId: z.custom<MembershipId>(
    (val) => val instanceof MembershipId,
    "Invalid membership ID"
  ),
});

export class BoardMembership {
  private constructor(
    public readonly boardMembershipId: BoardMembershipId,
    public readonly boardId: BoardId,
    public readonly membershipId: MembershipId
  ) {}

  static of(
    boardMembershipId: BoardMembershipId,
    boardId: BoardId,
    membershipId: MembershipId
  ): BoardMembership {
    const validated = boardMembershipSchema.parse({
      boardMembershipId,
      boardId,
      membershipId,
    });
    return new BoardMembership(
      validated.boardMembershipId,
      validated.boardId,
      validated.membershipId
    );
  }

  static tryOf(
    boardMembershipId: BoardMembershipId,
    boardId: BoardId,
    membershipId: MembershipId
  ):
    | { success: true; value: BoardMembership }
    | { success: false; error: string } {
    const result = boardMembershipSchema.safeParse({
      boardMembershipId,
      boardId,
      membershipId,
    });
    if (result.success) {
      return {
        success: true,
        value: new BoardMembership(
          result.data.boardMembershipId,
          result.data.boardId,
          result.data.membershipId
        ),
      };
    }
    return { success: false, error: result.error.message };
  }

  belongsToBoard(boardId: BoardId): boolean {
    return this.boardId.equals(boardId);
  }

  isMember(membershipId: MembershipId): boolean {
    return this.membershipId.equals(membershipId);
  }

  toJson(): {
    boardMembershipId: string;
    boardId: string;
    membershipId: string;
  } {
    return {
      boardMembershipId: this.boardMembershipId.toString(),
      boardId: this.boardId.toString(),
      membershipId: this.membershipId.toString(),
    };
  }
}
