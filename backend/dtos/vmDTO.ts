export type VmStatus = string;

export interface VmDTO {
    id: string;
    name: string;
    cores: number;
    ram: number;
    disk: number;
    os: string;
    status: VmStatus;
    createdAt?: string;
    updatedAt?: string;
}
