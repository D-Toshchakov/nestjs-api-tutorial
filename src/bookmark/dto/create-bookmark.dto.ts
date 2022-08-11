import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBookMarkDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsOptional()
    @IsString()
    description?: string

    @IsString()
    @IsNotEmpty()
    link: string
}