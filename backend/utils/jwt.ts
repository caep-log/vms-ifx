import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { requestDTO } from "../dtos/requestDTO";

export interface AccessTokenPayload {
    email: string;
    role: requestDTO["role"];
    id?: string;
}

const getSecret = () => process.env.JWT_SECRET || "development-only-secret";
const getRefreshSecret = () => process.env.JWT_REFRESH_SECRET || getSecret();

export class Jwt {
    static generate(payload: AccessTokenPayload) {
        return jwt.sign(payload, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] || "30m" });
    }

    static verify(token: string) {
        return jwt.verify(token, getSecret());
    }

    static generateRefresh(payload: { email: string; type: "backend_refresh"; jti: string }) {
        return jwt.sign(payload, getRefreshSecret(), { expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"] });
    }

    static verifyRefresh(token: string) {
        return jwt.verify(token, getRefreshSecret());
    }
}
