import { DIContainer } from "./di-container";
import { WorkspaceRepository } from "./infrastructure/WorkspaceRepository";
import { WorkspaceService } from "./service/WorkspaceService";
import { DrizzleDb } from "./types";

export type DependencyTypes = {
  // Workspace
  WorkspaceRepository: WorkspaceRepository;
  WorkspaceService: WorkspaceService;
};

export const createContainer = (db: DrizzleDb) => {
  const diContainer = new DIContainer<DependencyTypes>();

  // Workspace
  diContainer.register("WorkspaceRepository", WorkspaceRepository, db);
  diContainer.register(
    "WorkspaceService",
    WorkspaceService,
    diContainer.get("WorkspaceRepository")
  );

  return diContainer;
};
