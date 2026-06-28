import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ImageService } from './image.service.js';
import { CreateImageDto } from './dto/in/create-image.dto.js';
import { GetImagesFilterDto } from './dto/in/get-images-filter.dto.js';
import { ImageOutDto } from './dto/out/image-out.dto.js';
import { ImagesOutDto } from './dto/out/images-out.dto.js';
import { IdDto } from './dto/in/id.dto.js';
import { Response } from 'express';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

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
  async getImages(@Query() filterDto: GetImagesFilterDto): Promise<ImagesOutDto> {
    return this.imageService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single image by ID' })
  @ApiParam({ name: 'id', description: 'The ID of the image' })
  @ApiResponse({ status: 200, description: 'Return single image', type: ImageOutDto })
  @ApiResponse({ status: 404, description: 'Image not found' })
  async getImage(@Param() { id }: IdDto): Promise<ImageOutDto> {
    return this.imageService.findOne(id);
  }
}
