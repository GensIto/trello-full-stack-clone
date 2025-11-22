import { DIContainer } from "./di-container";
import { WorkspaceMembershipsRepository } from "./infrastructure/WorkspaceMembershipsRepository";
import { WorkspaceRepository } from "./infrastructure/WorkspaceRepository";
import { WorkspaceService } from "./service/WorkspaceService";
import { DrizzleDb } from "./types";

export type DependencyTypes = {
  // Workspace
  WorkspaceRepository: WorkspaceRepository;
  WorkspaceService: WorkspaceService;

  // WorkspaceMemberships
  WorkspaceMembershipsRepository: WorkspaceMembershipsRepository;
};

export const createContainer = (db: DrizzleDb) => {
  const diContainer = new DIContainer<DependencyTypes>();

  // Workspace
  diContainer.register("WorkspaceRepository", WorkspaceRepository, db);
  diContainer.register(
    "WorkspaceService",
    WorkspaceService,
    diContainer.get("WorkspaceRepository"),
    diContainer.get("WorkspaceMembershipsRepository"),
    db
  );

  return diContainer;
};
