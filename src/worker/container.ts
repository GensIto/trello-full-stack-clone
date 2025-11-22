import { DIContainer } from "./di-container";
import { WorkspaceMembershipsRepository } from "./infrastructure/WorkspaceMembershipsRepository";
import { WorkspaceInvitationsRepository } from "./infrastructure/WorkspaceInvitationsRepository";
import { WorkspaceRepository } from "./infrastructure/WorkspaceRepository";
import { WorkspaceService } from "./service/WorkspaceService";
import { WorkspaceInvitationsService } from "./service/WorkspaceInvitationsService";
import { DrizzleDb } from "./types";

export type DependencyTypes = {
  // Workspace
  WorkspaceRepository: WorkspaceRepository;
  WorkspaceService: WorkspaceService;

  // WorkspaceMemberships
  WorkspaceMembershipsRepository: WorkspaceMembershipsRepository;

  // WorkspaceInvitations
  WorkspaceInvitationsRepository: WorkspaceInvitationsRepository;
  WorkspaceInvitationsService: WorkspaceInvitationsService;
};

export const createContainer = (db: DrizzleDb) => {
  const diContainer = new DIContainer<DependencyTypes>();

  // Repositories
  diContainer.register("WorkspaceRepository", WorkspaceRepository, db);
  diContainer.register(
    "WorkspaceMembershipsRepository",
    WorkspaceMembershipsRepository,
    db
  );
  diContainer.register(
    "WorkspaceInvitationsRepository",
    WorkspaceInvitationsRepository,
    db
  );

  // Services
  diContainer.register(
    "WorkspaceService",
    WorkspaceService,
    diContainer.get("WorkspaceRepository"),
    diContainer.get("WorkspaceMembershipsRepository"),
    db
  );
  diContainer.register(
    "WorkspaceInvitationsService",
    WorkspaceInvitationsService,
    db,
    diContainer.get("WorkspaceInvitationsRepository"),
    diContainer.get("WorkspaceMembershipsRepository")
  );

  return diContainer;
};
