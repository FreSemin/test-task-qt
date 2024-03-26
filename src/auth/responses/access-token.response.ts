import { AccessToken } from '@auth/interfaces';
import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponse implements AccessToken {
    @ApiProperty()
    accessToken: string;
}
