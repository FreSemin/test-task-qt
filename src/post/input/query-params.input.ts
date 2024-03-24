import { IsOptional, IsUUID } from 'class-validator';

export class QueryParams {
    @IsOptional()
    @IsUUID()
    authorId?: string;
}
