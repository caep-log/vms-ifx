import { Request, Response } from "express";
import { z } from "zod";
import { AuthService, ConflictError, UnauthorizedError } from "../services/AuthService";
import { AuthSchema, SignUpSchema } from "../schemas/auth.schema";

const isProduction = process.env.NODE_ENV === "production";

const readCookie = (req: Request, name: string) =>
    req.headers.cookie?.split(";").map((v) => v.trim()).find((v) => v.startsWith(`${name}=`))?.slice(name.length + 1);

const setTokens = (res: Response, result: { accessToken: string; refreshToken: string }) => {
    const secure = isProduction ? "; Secure" : "";
    res.setHeader("Set-Cookie", [
        `accessToken=${result.accessToken}; HttpOnly; ${secure}; Path=/; SameSite=Lax`,
        `refresh_token=${result.refreshToken}; HttpOnly; ${secure}; Path=/api/users; SameSite=Lax`,
    ])
};

const clearTokens = (res: Response) =>
    res.setHeader("Set-Cookie", [
        "accessToken=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax",
        "refresh_token=; HttpOnly; Secure; Path=/api/users; Max-Age=0; SameSite=Lax",
    ]
);

const publicRole = (role: "Admin" | "Client") =>
    role === "Admin" ? "Administrador" : "Cliente";

const publicAuthResponse = (result: { user: { role: "Admin" | "Client"; [key: string]: unknown } }) => {
    const { role, ...user } = result.user;

    return {
        user,
        role: publicRole(result.user.role),
    };
};

const handleError = (res: Response, error: unknown) => {
    if (error instanceof UnauthorizedError)
        return res.status(401).json({ message: error.message });
    if (error instanceof ConflictError)
        return res.status(409).json({ message: error.message });
    if (error instanceof z.ZodError)
        return res.status(400).json({ message: `Datos inválidos. ${error}` });
    return res.status(500).json({ message: "Error interno del servidor" });
};

export class UsersController {
    constructor(
        private readonly service: AuthService
    ) {}

    login = async (req: Request, res: Response) => {
        try {
            const result = await this.service.auth(AuthSchema.parse(req.body));
            setTokens(res, result);
            return res.json(publicAuthResponse(result));
        } catch (e) {
            console.log(e);
            return handleError(res, e);
        }
    };

    signUp = async (req: Request, res: Response) => {
        try {
            const result = await this.service.signUp(SignUpSchema.parse(req.body));
            setTokens(res, result);
            return res.status(201).json(publicAuthResponse(result));
        } catch (e) {
            return handleError(res, e);
        }
    };

    refresh = async (req: Request, res: Response) => {
        try {
            const token = readCookie(req, "refresh_token");
            if (!token) throw new UnauthorizedError("Refresh token requerido");
            const result = await this.service.refresh(token);
            setTokens(res, result);
            return res.json(publicAuthResponse(result));
        } catch (e) {
            return handleError(res, e);
        }
    };

    session = async (req: Request, res: Response) => {
        try {
            const email = res.locals.user?.email;
            if (!email) throw new UnauthorizedError("Unauthorized");
            return res.json(publicAuthResponse(await this.service.session(email)));
        } catch (e) {
            return handleError(res, e);
        }
    };

    logout = async (req: Request, res: Response) => {
        const token = readCookie(req, "refresh_token");
        if (token) await this.service.logout(token);
        clearTokens(res);
        return res.status(204).send();
    };

    deleteUser = async (req: Request, res: Response) => {
        try {
            const email = res.locals.user?.email;

            if (!email) throw new UnauthorizedError("Unauthorized");
            await this.service.deleteUser(email);
            return res.status(204).send();
        } catch (e) {
            return handleError(res, e);
        }
    };
}
