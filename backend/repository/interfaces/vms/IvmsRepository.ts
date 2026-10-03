import { VmDTO } from "../../../dtos/vmDTO";

export interface IvmsRepository {
    readonly findAll: () => Promise<VmDTO[]>;
    readonly findById: (id: string) => Promise<VmDTO | null>;
    readonly create: (vm: VmDTO) => Promise<VmDTO>;
    readonly update: (id: string, changes: Partial<Omit<VmDTO, "id">>) => Promise<VmDTO | null>;
    readonly delete: (id: string) => Promise<void>;
}
