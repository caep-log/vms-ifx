import { type NextFunction, type Request, type Response } from "express";
import { Jwt, type AccessTokenPayload } from "../utils/jwt";

export class JwtMiddleware {
    static authenticate(req: Request, res: Response, next: NextFunction) {
        const cookieToken = req.headers.cookie
            ?.split(";")
            .map((cookie) => cookie.trim())
            .find((cookie) => cookie.startsWith("accessToken="))
            ?.slice("accessToken=".length);
        const headerToken = req.headers.authorization?.startsWith("Bearer ")
            ? req.headers.authorization.slice(7)
            : undefined;
        const token = cookieToken ?? headerToken;

        if (!token) return res.status(401).json({ message: "Token is required" });

        try {
            const payload = Jwt.verify(decodeURIComponent(token));
            if (typeof payload === "string" || typeof payload.email !== "string" || typeof payload.role !== "string") {
                return res.status(401).json({ message: "Token invalid" });
            }

            res.locals.user = payload as AccessTokenPayload;
            return next();
        } catch {
            return res.status(401).json({ message: "Unauthorized" });
        }
    }

    static admin(_req: Request, res: Response, next: NextFunction) {
        const user = res.locals.user as AccessTokenPayload | undefined;
        if (user?.role !== "Admin") {
            return res.status(403).json({ message: "Permisos insuficientes" });
        }
        next();
    }
}
