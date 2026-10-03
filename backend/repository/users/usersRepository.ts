import { AWSCreate, AWSDelete, AWSScanAll, AWSUpdate } from "../../config/config";
import { requestDTO } from "../../dtos/requestDTO";
import { IUsersRepository } from "../interfaces/users/IUsersRepository";

export class UsersRepository implements IUsersRepository {
    private readonly tableName = process.env.DYNAMODB_USERS_TABLE || "users";

    async findByEmail(email: string): Promise<requestDTO | null> {
        const users = await AWSScanAll(this.tableName);
        const user = users.find((item) => item.email === email);
        return (user as requestDTO | undefined) ?? null;
    }

    async create(user: requestDTO): Promise<void> {
        await AWSCreate(this.tableName, user);
    }

    async update(user: Partial<requestDTO> & Pick<requestDTO, "id">): Promise<void> {
        if (!user.id) throw new Error("User id is required");
        const { id, ...values } = user;
        await AWSUpdate(this.tableName, { id }, values);
    }

    async delete(email: string): Promise<void> {
        const user = await this.findByEmail(email);
        if (user?.id) await AWSDelete(this.tableName, { id: user.id });
    }
}
