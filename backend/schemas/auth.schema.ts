import { z } from "zod";

export const AuthSchema = z.object({
    email: z.string().trim().email(),
    password: z.string().min(8),
});

export const SignUpSchema = AuthSchema.extend({
    name: z.string().trim().min(1).max(120).optional(),
    role: z.enum(["Admin", "Client"]).default("Client"),
});

export const RefreshTokenSchema = z.object({
    refreshToken: z.string().min(1).optional(),
});

export type AuthInput = z.infer<typeof AuthSchema>;
export type SignUpInput = z.infer<typeof SignUpSchema>;
