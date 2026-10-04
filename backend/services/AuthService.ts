import { randomUUID } from "node:crypto";
import { IUsersRepository } from "../repository/interfaces/users/IUsersRepository";
import { requestDTO } from "../dtos/requestDTO";
import { Jwt } from "../utils/jwt";
import { hashPassword, verifyPassword } from "../utils/password";
import { AuthInput, SignUpInput } from "../schemas/auth.schema";

// Cognito queda preparado en CognitoIdentityService.ts para una futura migración.
// El workflow actual usa DynamoDB directamente para facilitar el entorno local.

export class UnauthorizedError extends Error {}
export class ConflictError extends Error {}

type PublicUser = Omit<requestDTO, "passwordHash" | "passwordSalt" | "refreshTokenJti">;

const publicUser = (user: requestDTO): PublicUser => {
    const { passwordHash, passwordSalt, refreshTokenJti, ...safeUser } = user;
    return safeUser;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const invalidRefreshToken = () => new UnauthorizedError("Refresh token inválido");

export class AuthService {
    constructor(private readonly repository: IUsersRepository) {}

    async auth(dto: AuthInput) {
        const user = await this.repository.findByEmail(normalizeEmail(dto.email));
        if (!user?.passwordHash || !(await verifyPassword(dto.password, user.passwordHash))) {
            throw new UnauthorizedError("Credenciales inválidas");
        }

        // Futuro Cognito:
        // await this.identity.authenticate(normalizeEmail(dto.email), dto.password);
        return this.issueTokens(user);
    }

    async signUp(dto: SignUpInput) {
        const email = normalizeEmail(dto.email);
        if (await this.repository.findByEmail(email)) {
            throw new ConflictError("El correo ya está registrado");
        }

        // Futuro Cognito:
        // const { userSub } = await this.identity.createUser(email, dto.password, dto.name);
        const user: requestDTO = {
            id: randomUUID(),
            email,
            role: dto.role,
            ...(dto.name ? { name: dto.name } : {}),
            passwordHash: await hashPassword(dto.password),
            createdAt: new Date().toISOString(),
        };

        await this.repository.create(user);
        return this.issueTokens(user);
    }

    async refresh(refreshToken: string) {
        let payload: any;
        try { payload = Jwt.verifyRefresh(refreshToken); } catch { throw invalidRefreshToken(); }
        if (payload?.type !== "backend_refresh" || !payload.email || !payload.jti) throw invalidRefreshToken();

        const user = await this.repository.findByEmail(payload.email);
        if (!user || user.refreshTokenJti !== payload.jti) throw new UnauthorizedError("Refresh token revocado");
        return this.issueTokens(user);
    }

    async logout(refreshToken: string) {
        let payload: any;
        try { payload = Jwt.verifyRefresh(refreshToken); } catch { return; }
        const user = payload?.email ? await this.repository.findByEmail(payload.email) : null;
        if (user?.id && user.refreshTokenJti === payload.jti) {
            await this.repository.update({ id: user.id, refreshTokenJti: randomUUID() });
        }
    }

    async deleteUser(email: string) {
        if (!email) throw new Error("Email is required");
        await this.repository.delete(normalizeEmail(email));
        return { message: "Usuario eliminado" };
    }

    async session(email: string) {
        const user = await this.repository.findByEmail(normalizeEmail(email));
        if (!user) throw new UnauthorizedError("Usuario no encontrado");
        return { user: publicUser(user) };
    }

    private async issueTokens(user: requestDTO) {
        const jti = randomUUID();
        if (!user.id) throw new Error("User id is required");
        await this.repository.update({ id: user.id, refreshTokenJti: jti });
        return {
            user: publicUser(user),
            accessToken: Jwt.generate(publicUser(user)),
            refreshToken: Jwt.generateRefresh({ email: user.email, type: "backend_refresh", jti }),
        };
    }
}
