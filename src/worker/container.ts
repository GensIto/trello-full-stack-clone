import { DIContainer } from "./di-container";
import { WorkspaceMembershipsRepository } from "./infrastructure/WorkspaceMembershipsRepository";
import { WorkspaceInvitationsRepository } from "./infrastructure/WorkspaceInvitationsRepository";
import { WorkspaceRepository } from "./infrastructure/WorkspaceRepository";
import { WorkspaceService } from "./service/WorkspaceService";
import { WorkspaceMembershipsService } from "./service/WorkspaceMembershipsService";
import { BoardRepository } from "./infrastructure/BoardRepository";
import { BoardService } from "./service/BoardService";
import { DrizzleDb } from "./types";
import { WorkspaceInvitationsService } from "./service/WorkspaceInvitationsService";
import { BoardMembershipsRepository } from "./infrastructure/BoardMembershipsRepository";
import { BoardMembershipsService } from "./service/BoardMembershipsService";
import { CardRepository } from "./infrastructure/CardRepository";
import { CardService } from "./service/CardService";

export type DependencyTypes = {
  // Workspace
  WorkspaceRepository: WorkspaceRepository;
  WorkspaceService: WorkspaceService;

  // WorkspaceMemberships
  WorkspaceMembershipsRepository: WorkspaceMembershipsRepository;
  WorkspaceMembershipsService: WorkspaceMembershipsService;

  // Board
  BoardRepository: BoardRepository;
  BoardService: BoardService;

  // WorkspaceInvitations
  WorkspaceInvitationsRepository: WorkspaceInvitationsRepository;
  WorkspaceInvitationsService: WorkspaceInvitationsService;

  // BoardMemberships
  BoardMembershipsRepository: BoardMembershipsRepository;
  BoardMembershipsService: BoardMembershipsService;

  // Card
  CardRepository: CardRepository;
  CardService: CardService;
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
  diContainer.register("BoardRepository", BoardRepository, db);
  diContainer.register(
    "WorkspaceInvitationsRepository",
    WorkspaceInvitationsRepository,
    db
  );
  diContainer.register(
    "BoardMembershipsRepository",
    BoardMembershipsRepository,
    db
  );
  diContainer.register("CardRepository", CardRepository, db);

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
  diContainer.register(
    "WorkspaceMembershipsService",
    WorkspaceMembershipsService,
    diContainer.get("WorkspaceMembershipsRepository")
  );
  diContainer.register(
    "BoardService",
    BoardService,
    diContainer.get("BoardRepository"),
    diContainer.get("WorkspaceMembershipsRepository"),
    diContainer.get("BoardMembershipsRepository"),
    db
  );
  diContainer.register(
    "BoardMembershipsService",
    BoardMembershipsService,
    diContainer.get("BoardMembershipsRepository")
  );
  diContainer.register(
    "CardService",
    CardService,
    diContainer.get("CardRepository")
  );
  return diContainer;
};
