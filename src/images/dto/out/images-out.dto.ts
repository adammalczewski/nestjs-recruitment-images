import { ApiProperty } from '@nestjs/swagger';
import { ImageOutDto } from './image-out.dto.js';

export class ImagesOutDto {
  @ApiProperty({
    type: [ImageOutDto],
    description: 'Array of image records',
  })
  data!: ImageOutDto[];

  @ApiProperty({ description: 'Current page number', example: 1 })
  page!: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit!: number;
}
