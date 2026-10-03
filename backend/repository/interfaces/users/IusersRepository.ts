import { requestDTO } from "../../../dtos/requestDTO";

export interface IusersRepository {
    readonly findByEmail: (email: string) => Promise<requestDTO | null>;
    readonly create: (user: requestDTO) => Promise<requestDTO>;
    readonly update: (user: requestDTO) => Promise<requestDTO>;
    readonly delete: (email: string) => Promise<void>;
}