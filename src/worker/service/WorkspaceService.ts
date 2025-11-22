import { Workspace } from "../domain/entities";
import { WorkspaceId } from "../domain/value-object";
import { IWorkspaceRepository } from "../infrastructure/WorkspaceRepository";

export interface IWorkspaceService {
  findWorkspaceById(id: string): Promise<Workspace>;
  createWorkspace(workspace: Workspace): Promise<Workspace>;
  updateWorkspace(workspace: Workspace): Promise<Workspace>;
  deleteWorkspace(id: string): Promise<void>;
}

export class WorkspaceService implements IWorkspaceService {
  constructor(private workspaceRepository: IWorkspaceRepository) {}

  async findWorkspaceById(id: string): Promise<Workspace> {
    return this.workspaceRepository.findById(WorkspaceId.of(id));
  }

  async createWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.create(workspace);
  }

  async updateWorkspace(workspace: Workspace): Promise<Workspace> {
    return this.workspaceRepository.update(workspace);
  }

  async deleteWorkspace(id: string): Promise<void> {
    return this.workspaceRepository.delete(WorkspaceId.of(id));
  }
}
