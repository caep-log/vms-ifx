import { Request, Response } from "express";
import { VmNotFoundError, VmsService } from "../service/VmsService";
import { VmCreateSchema, VmUpdateSchema } from "../schemas/vm.schema";

export class VmController {
    constructor(private readonly service: VmsService) {}

    getAll = async (_req: Request, res: Response) => {
        try {
            return res.json(await this.service.getAll());
        } catch {
            return res.status(500).json({ message: "Error interno del servidor" });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            return res.status(201).json(await this.service.create(VmCreateSchema.parse(req.body)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            return res.json(await this.service.update(String(req.params.id), VmUpdateSchema.parse(req.body)));
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    delete = async (req: Request, res: Response) => {
        try {
            await this.service.delete(String(req.params.id));
            return res.status(204).send();
        } catch (error) {
            return this.handleError(res, error);
        }
    };

    private handleError(res: Response, error: unknown) {
        if (error instanceof VmNotFoundError) return res.status(404).json({ message: error.message });
        if (error instanceof Error && error.name === "ZodError") return res.status(400).json({ message: "Datos inválidos" });
        return res.status(500).json({ message: "Error interno del servidor" });
    }
}
