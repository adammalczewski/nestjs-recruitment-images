import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ImageService } from './image.service.js';
import { CreateImageDto } from './dto/in/create-image.dto.js';
import { GetImagesFilterDto } from './dto/in/get-images-filter.dto.js';
import { ImageOutDto } from './dto/out/image-out.dto.js';
import { ImagesOutDto } from './dto/out/images-out.dto.js';
import { BadRequestDto } from './dto/out/bad-request.dto.js';
import { IdDto } from './dto/in/id.dto.js';

@ApiTags('images')
@Controller('images')
export class ImageController {
  constructor(
    private readonly imageService: ImageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Upload an image' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image upload with title and optional dimensions',
    type: CreateImageDto,
  })
  @ApiResponse({ status: 201, description: 'Image successfully uploaded and processed', type: ImageOutDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestDto })
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ): Promise<ImageOutDto> {
    return this.imageService.create(file, createImageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get a list of images with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Return list of images', type: ImagesOutDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestDto })
  async getImages(@Query() filterDto: GetImagesFilterDto): Promise<ImagesOutDto> {
    return this.imageService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single image by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the image' })
  @ApiResponse({ status: 200, description: 'Return single image', type: ImageOutDto })
  @ApiResponse({ status: 400, description: 'Bad Request', type: BadRequestDto })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getImage(@Param() { id }: IdDto): Promise<ImageOutDto> {
    return this.imageService.findOne(id);
  }
}
