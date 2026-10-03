export type UserRole = "Administrador" | "Cliente";

export interface requestDTO {
    email: string;
    role: UserRole;
    id?: string;
    name?: string;
    passwordHash?: string;
    passwordSalt?: string;
    refreshTokenJti?: string;
    createdAt?: string;
    updatedAt?: string;
}
