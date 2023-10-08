import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'Ajoyib iqtibos', description: 'Quote text' })
  @IsNotEmpty()
  @IsString()
  text: string;
}
