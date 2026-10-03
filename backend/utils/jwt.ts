import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { requestDTO } from "../dtos/requestDTO";

const secret = process.env.JWT_SECRET!;
const refreshSecret = process.env.JWT_REFRESH_SECRET || secret;
const options: SignOptions = {
    expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
};
const refreshOptions: SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"]
};

export class Jwt {
    static generate(payload: requestDTO) {
        return jwt.sign(payload, secret, options);
    }

    static verify(token: string) {
        return jwt.verify(token, secret);
    }

    static generateRefresh(payload: { email: string; type: "backend_refresh"; jti: string }) {
        return jwt.sign(payload, refreshSecret, refreshOptions);
    }

    static verifyRefresh(token: string) {
        return jwt.verify(token, refreshSecret);
    }
}