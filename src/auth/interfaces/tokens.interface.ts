import { RefreshToken } from './refresh-token.interface';

export interface Tokens {
    accessToken: string;
    refreshToken: RefreshToken;
}
