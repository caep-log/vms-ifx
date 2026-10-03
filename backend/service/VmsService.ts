import { randomUUID } from "node:crypto";
import { VmDTO } from "../dtos/vmDTO";
import { IvmsRepository } from "../repository/interfaces/vms/IvmsRepository";
import { VmCreateInput, VmUpdateInput } from "../schemas/vm.schema";

export class VmNotFoundError extends Error {}

export class VmsService {
    constructor(private readonly repository: IvmsRepository) {}

    async getAll(): Promise<VmDTO[]> {
        return this.repository.findAll();
    }

    async create(dto: VmCreateInput): Promise<VmDTO> {
        const now = new Date().toISOString();
        const vm: VmDTO = { id: randomUUID(), ...dto, createdAt: now, updatedAt: now };
        return this.repository.create(vm);
    }

    async update(id: string, dto: VmUpdateInput): Promise<VmDTO> {
        const updated = await this.repository.update(id, { ...dto, updatedAt: new Date().toISOString() });
        if (!updated) throw new VmNotFoundError("VM no encontrada");
        return updated;
    }

    async delete(id: string): Promise<void> {
        if (!(await this.repository.findById(id))) {
            throw new VmNotFoundError("VM no encontrada");
        }
        await this.repository.delete(id);
    }
}
