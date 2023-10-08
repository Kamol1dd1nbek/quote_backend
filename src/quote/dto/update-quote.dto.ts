import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class UpdateQuoteDto {
    @ApiProperty({example: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.", description: "Quote text"})
    @IsNotEmpty()
    @IsString()
    text: string;

    @ApiProperty({example: ["eynshteyn", "quote", "uz", "new"]})
    @IsArray()
    tags: [string];
}
