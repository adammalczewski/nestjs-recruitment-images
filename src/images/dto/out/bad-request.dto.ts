import { ApiProperty } from '@nestjs/swagger';

export class BadRequestDto {
  @ApiProperty({
    description: 'List of validation error messages',
    example: ['width must not be less than 1'],
    type: [String],
  })
  message!: string[];

  @ApiProperty({
    description: 'The type of error',
    example: 'Bad Request',
  })
  error!: string;

  @ApiProperty({
    description: 'HTTP status code',
    example: 400,
  })
  statusCode!: number;
}
