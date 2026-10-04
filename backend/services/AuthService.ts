import { randomUUID } from "node:crypto";
import { IUsersRepository } from "../repository/interfaces/users/IUsersRepository";
import { requestDTO } from "../dtos/requestDTO";
import { Jwt } from "../utils/jwt";
import { AuthInput, SignUpInput } from "../schemas/auth.schema";
import { CognitoIdentityService } from "./CognitoIdentityService";

export class UnauthorizedError extends Error {}
export class ConflictError extends Error {}
export class RegistrationError extends Error {}

type PublicUser = Omit<requestDTO, "refreshTokenJti">;

const publicUser = (user: requestDTO): PublicUser => {
    const { refreshTokenJti, ...safeUser } = user;
    return safeUser;
};

const normalizeEmail = (email: string) => email.trim().toLowerCase();
const invalidRefreshToken = () => new UnauthorizedError("Refresh token inválido");

export class AuthService {
    constructor(
        private readonly repository: IUsersRepository,
        private readonly identity: CognitoIdentityService,
    ) {}

    async auth(dto: AuthInput) {
        const email = normalizeEmail(dto.email);
        const user = await this.repository.findByEmail(email);
        if (!user) throw new UnauthorizedError("Credenciales inválidas");

        try {
            await this.identity.authenticate(email, dto.password);
        } catch {
            throw new UnauthorizedError("Credenciales inválidas");
        }

        return this.issueTokens(user);
    }

    async signUp(dto: SignUpInput) {
        const email = normalizeEmail(dto.email);
        if (await this.repository.findByEmail(email)) {
            throw new ConflictError("El correo ya está registrado");
        }

        let userSub: string;
        try {
            userSub = (await this.identity.createUser(email, dto.password, dto.name)).userSub;
        } catch (error: any) {
            if (error?.name === "UsernameExistsException") {
                throw new ConflictError("El correo ya está registrado");
            }
            throw error;
        }

        const user: requestDTO = {
            id: userSub,
            email,
            role: dto.role,
            ...(dto.name ? { name: dto.name } : {}),
            createdAt: new Date().toISOString(),
        };

        try {
            await this.repository.create(user);
        } catch {
            try {
                await this.identity.deleteUser(userSub);
            } catch (rollbackError) {
                console.error("No fue posible compensar el usuario de Cognito", { userSub, rollbackError });
            }
            throw new RegistrationError("No fue posible crear el perfil del usuario");
        }

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
