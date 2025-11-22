import { eq } from "drizzle-orm";
import { workspaceMemberships } from "../db/workspace-schema";
import { WorkspaceMembership } from "../domain/entities";
import {
  MembershipId,
  MembershipStatus,
  RoleId,
  UserId,
  WorkspaceId,
} from "../domain/value-object";
import { DrizzleDb, DrizzleTransaction } from "../types";

export interface IWorkspaceMembershipsRepository {
  findById(id: MembershipId): Promise<WorkspaceMembership>;
  findByWorkspaceId(workspaceId: WorkspaceId): Promise<WorkspaceMembership[]>;
  findByUserId(userId: UserId): Promise<WorkspaceMembership>;
  create(
    workspaceMembership: WorkspaceMembership,
    tx: DrizzleTransaction
  ): Promise<WorkspaceMembership>;
  update(
    workspaceMembership: WorkspaceMembership
  ): Promise<WorkspaceMembership>;
  delete(id: WorkspaceId): Promise<void>;
}

export class WorkspaceMembershipsRepository
  implements IWorkspaceMembershipsRepository
{
  public constructor(private readonly db: DrizzleDb) {}
  async findById(id: MembershipId): Promise<WorkspaceMembership> {
    const workspaceMembership = await this.db
      .select()
      .from(workspaceMemberships)
      .where(eq(workspaceMemberships.membershipId, id.toString()))
      .get();
    if (!workspaceMembership) {
      throw new Error(
        `Workspace membership with id ${id.toString()} not found`
      );
    }
    return WorkspaceMembership.of(
      MembershipId.of(workspaceMembership.membershipId),
      WorkspaceId.of(workspaceMembership.workspaceId),
      UserId.of(workspaceMembership.userId),
      MembershipStatus.of(workspaceMembership.status),
      RoleId.of(workspaceMembership.roleId)
    );
  }
  async findByWorkspaceId(
    workspaceId: WorkspaceId
  ): Promise<WorkspaceMembership[]> {
    const result = await this.db
      .select()
      .from(workspaceMemberships)
      .where(eq(workspaceMemberships.workspaceId, workspaceId.toString()))
      .all();
    return result.map((workspaceMembership) =>
      WorkspaceMembership.of(
        MembershipId.of(workspaceMembership.membershipId),
        WorkspaceId.of(workspaceMembership.workspaceId),
        UserId.of(workspaceMembership.userId),
        MembershipStatus.of(workspaceMembership.status),
        RoleId.of(workspaceMembership.roleId)
      )
    );
  }
  async findByUserId(userId: UserId): Promise<WorkspaceMembership> {
    const result = await this.db
      .select()
      .from(workspaceMemberships)
      .where(eq(workspaceMemberships.userId, userId.toString()))
      .get();
    if (!result) {
      throw new Error(
        `Workspace membership with user id ${userId.toString()} not found`
      );
    }
    return WorkspaceMembership.of(
      MembershipId.of(result.membershipId),
      WorkspaceId.of(result.workspaceId),
      UserId.of(result.userId),
      MembershipStatus.of(result.status),
      RoleId.of(result.roleId)
    );
  }
  async create(
    workspaceMembership: WorkspaceMembership,
    tx?: DrizzleTransaction
  ): Promise<WorkspaceMembership> {
    const db = tx ?? this.db;
    const result = await db
      .insert(workspaceMemberships)
      .values({
        membershipId: workspaceMembership.membershipId.toString(),
        workspaceId: workspaceMembership.workspaceId.toString(),
        userId: workspaceMembership.userId.toString(),
        roleId: workspaceMembership.roleId.value,
      })
      .returning()
      .get();
    if (!result) {
      throw new Error(`Failed to create workspace membership`);
    }
    return WorkspaceMembership.of(
      MembershipId.of(result.membershipId),
      WorkspaceId.of(result.workspaceId),
      UserId.of(result.userId),
      MembershipStatus.of(result.status),
      RoleId.of(result.roleId)
    );
  }
  async update(
    workspaceMembership: WorkspaceMembership
  ): Promise<WorkspaceMembership> {
    const result = await this.db
      .update(workspaceMemberships)
      .set({
        roleId: workspaceMembership.roleId.value,
      })
      .where(
        eq(
          workspaceMemberships.membershipId,
          workspaceMembership.membershipId.toString()
        )
      )
      .returning()
      .get();
    if (!result) {
      throw new Error(`Failed to update workspace membership`);
    }
    return WorkspaceMembership.of(
      MembershipId.of(result.membershipId),
      WorkspaceId.of(result.workspaceId),
      UserId.of(result.userId),
      MembershipStatus.of(result.status),
      RoleId.of(result.roleId)
    );
  }
  async delete(workspaceId: WorkspaceId): Promise<void> {
    await this.db
      .delete(workspaceMemberships)
      .where(eq(workspaceMemberships.workspaceId, workspaceId.toString()));
  }
}
