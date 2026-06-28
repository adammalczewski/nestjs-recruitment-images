import { ApiProperty } from '@nestjs/swagger';

export class ImageOutDto {
  @ApiProperty({ description: 'The unique identifier of the image', example: 1 })
  id!: number;

  @ApiProperty({ description: 'The title of the image', example: 'Sunset at the beach', required: false })
  title?: string;

  @ApiProperty({ description: 'The URL where the image can be accessed', example: 'http://localhost:3000/images/file/abc-123.jpg' })
  url!: string;

  @ApiProperty({ description: 'The width of the image in pixels', example: 1920 })
  width!: number;

  @ApiProperty({ description: 'The height of the image in pixels', example: 1080 })
  height!: number;
}
