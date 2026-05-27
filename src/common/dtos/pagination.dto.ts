import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer"
import { IsOptional, IsPort, IsPositive, Min } from "class-validator"

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many rows do yo need'
    })
    @IsOptional()
    @IsPositive()
    //Transformar
    @Type(() => Number)
    limit?: number

    @ApiProperty({
        default: 10,
        description: 'How many rows do yo want to skip'
    })
    @IsOptional()
    @Min(0)
    @Type(() => Number)
    offset?: number
}