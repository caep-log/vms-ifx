import { AWSCreate, AWSDelete, AWSScanAll, AWSUpdate } from "../../config/config";
import { VmDTO } from "../../dtos/vmDTO";
import { IvmsRepository } from "../interfaces/vms/IvmsRepository";

export class VmsRepository implements IvmsRepository {
    private readonly tableName = process.env.DYNAMODB_VMS_TABLE || "vms";

    async findAll(): Promise<VmDTO[]> {
        return (await AWSScanAll(this.tableName)) as VmDTO[];
    }

    async findById(id: string): Promise<VmDTO | null> {
        const items = await AWSScanAll(this.tableName);
        return (items.find((item) => item.id === id) as VmDTO | undefined) ?? null;
    }

    async create(vm: VmDTO): Promise<VmDTO> {
        await AWSCreate(this.tableName, vm);
        return vm;
    }

    async update(id: string, changes: Partial<Omit<VmDTO, "id">>): Promise<VmDTO | null> {
        if (Object.keys(changes).length === 0) return this.findById(id);
        const current = await this.findById(id);
        if (!current) return null;

        await AWSUpdate(this.tableName, { id }, changes);
        return { ...current, ...changes };
    }

    async delete(id: string): Promise<void> {
        await AWSDelete(this.tableName, { id });
    }
}
