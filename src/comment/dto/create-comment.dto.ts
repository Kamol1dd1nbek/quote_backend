import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";

export class CreateCommentDto {
    @ApiProperty({ example: "Ajoyib iqtibos", description: "Quote text" })
    @IsNotEmpty()
    @IsString()
    text: string;

    @ApiProperty({ example: "6", description: "Quote id" })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    quote_id: number;
}
