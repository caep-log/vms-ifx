import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);

export const hashPassword = async (password: string): Promise<string> => {
    const salt = randomBytes(16).toString("hex");
    const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
    return `${salt}:${derivedKey.toString("hex")}`;
};

export const verifyPassword = async (password: string, storedHash: string): Promise<boolean> => {
    const [salt, expectedHex, extraPart] = storedHash.split(":");
    if (!salt || !expectedHex || extraPart || expectedHex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(expectedHex)) {
        return false;
    }

    try {
        const expected = Buffer.from(expectedHex, "hex");
        const actual = (await scrypt(password, salt, expected.length)) as Buffer;
        return expected.length === actual.length && timingSafeEqual(expected, actual);
    } catch {
        return false;
    }
};
