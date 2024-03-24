import { Request } from 'express';

export function extractTokenFromHeader(req: Request): string | null {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];

    return type === 'Bearer' ? token : null;
}
