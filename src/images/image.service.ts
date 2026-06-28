import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Image } from './image.entity.js';
import { CreateImageDto } from './dto/in/create-image.dto.js';
import { GetImagesFilterDto } from './dto/in/get-images-filter.dto.js';
import { ImageOutDto } from './dto/out/image-out.dto.js';
import { ImagesOutDto } from './dto/out/images-out.dto.js';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly configService: ConfigService,
  ) {}

  async findAll(filterDto: GetImagesFilterDto): Promise<ImagesOutDto> {
    const { title, page = 1, limit = 10 } = filterDto;
    const skip = (page - 1) * limit;

    const queryOptions: any = {
      take: limit,
      skip: skip,
    };

    if (title) {
      queryOptions.where = {
        title: Like(`%${title}%`),
      };
    }

    const data = await this.imageRepository.find(queryOptions);

    return {
      data,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<ImageOutDto> {
    const image = await this.imageRepository.findOne({ where: { id } });
    if (!image) {
      throw new NotFoundException(`Image with ID ${id} not found`);
    }
    return image;
  }

  async create(file: Express.Multer.File, createDto: CreateImageDto): Promise<ImageOutDto> {

    let imageProcessor = sharp(file.buffer);
    const metadata = await imageProcessor.metadata();

    let width = metadata.width as number;
    let height = metadata.height as number;

    if (createDto.width || createDto.height) {
      const targetWidth = createDto.width;
      const targetHeight = createDto.height;
      
      const resizedBuffer = await imageProcessor
        .resize(targetWidth, targetHeight, { fit: 'inside' })
        .toBuffer();
      
      const resizedMetadata = await sharp(resizedBuffer).metadata();
      width = resizedMetadata.width as number;
      height = resizedMetadata.height as number;
    }

    const url = `http://localhost:3000/images/file/`;

    const newImage = this.imageRepository.create({
      title: createDto.title,
      url,
      width,
      height,
    });

    return this.imageRepository.save(newImage);
  }
}
