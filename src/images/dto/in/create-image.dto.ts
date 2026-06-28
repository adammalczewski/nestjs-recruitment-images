import { IsString, IsOptional, IsInt, MinLength, Min, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateImageDto {
  @ApiProperty({ description: 'The title of the image', minLength: 1 })
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  // Left here due to Swagger and validation, FileInterceptor sets this to undefined.
  @ApiProperty({ type: 'string', format: 'binary', description: 'The image file to upload' })
  @IsOptional()
  image?: undefined;

  @ApiProperty({ description: 'Optional target width for resizing', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  width?: number;

  @ApiProperty({ description: 'Optional target height for resizing', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  height?: number;
}
