import { requestDTO } from "../../../dtos/requestDTO";

export interface IUsersRepository {
    readonly findByEmail: (email: string) => Promise<requestDTO | null>;
    readonly create: (user: requestDTO) => Promise<void>;
    readonly update: (user: Partial<requestDTO> & Pick<requestDTO, "id">) => Promise<void>;
    readonly delete: (email: string) => Promise<void>;
}
