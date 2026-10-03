import { z } from "zod";

export const VmCreateSchema = z.object({
    name: z.string().trim().min(1).max(120),
    cores: z.number().int().positive(),
    ram: z.number().positive(),
    disk: z.number().positive(),
    os: z.string().trim().min(1).max(120),
    status: z.string().trim().min(1).max(50),
});

export const VmUpdateSchema = VmCreateSchema.partial();

export type VmCreateInput = z.infer<typeof VmCreateSchema>;
export type VmUpdateInput = z.infer<typeof VmUpdateSchema>;
