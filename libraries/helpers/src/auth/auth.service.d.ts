export declare function decrypt_legacy_using_IV(hexCiphertext: string): string;
export declare function encrypt_legacy_using_IV(utf8Plaintext: string): string;
export declare class AuthService {
    static hashPassword(password: string): string;
    static comparePassword(password: string, hash: string): boolean;
    static signJWT(value: object): string;
    static verifyJWT(token: string): string | import("jsonwebtoken").JwtPayload;
    static fixedEncryption(value: string): string;
    static fixedDecryption(hash: string): string;
}
