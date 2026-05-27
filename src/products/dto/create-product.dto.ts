import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {

    @ApiProperty({
        default: 'Product title',
        nullable: false,
        minLength: 1
    })
    @IsString()
    @MinLength(1)
    title: string;

    @ApiProperty({})
    @IsNumber()
    @IsPositive()
    @IsOptional()
    price?: number;

    @ApiProperty({})
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiProperty({})
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({})
    @IsInt()
    @IsPositive()
    @IsOptional()
    stock?: number;

    @ApiProperty({})
    @IsString({ each: true })
    @IsArray()
    sizes: string[];

    @ApiProperty({})
    @IsIn(['men', 'women', 'kid', 'unisex']) //Validaciones 
    gender: string

    //Tags
    @ApiProperty({})
    @IsString({ each: true })
    @IsArray()
    tags: string[];

    //Images
    @IsString({ each: true })
    @IsArray()
    @IsOptional()
    images?: string[];

}
