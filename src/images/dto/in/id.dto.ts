import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class IdDto {
  @ApiProperty({ description: 'The unique identifier', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  id!: number;
}
