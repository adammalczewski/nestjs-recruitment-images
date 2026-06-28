import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Image } from './image.entity.js';
import { CreateImageDto } from './dto/in/create-image.dto.js';
import { GetImagesFilterDto } from './dto/in/get-images-filter.dto.js';
import { ImageOutDto } from './dto/out/image-out.dto.js';
import { ImagesOutDto } from './dto/out/images-out.dto.js';
import sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MinioService } from '../minio/minio.service.js';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly minioService: MinioService,
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

    const imageProcessor = sharp(file.buffer);
    const metadata = await imageProcessor.metadata();

    let width = metadata.width as number;
    let height = metadata.height as number;
    let finalBuffer = file.buffer;

    if (createDto.width || createDto.height) {
      const targetWidth = createDto.width;
      const targetHeight = createDto.height;
      
      finalBuffer = await imageProcessor
        .resize(targetWidth, targetHeight, { fit: 'fill' })
        .toBuffer();
      
      const resizedMetadata = await sharp(finalBuffer).metadata();
      width = resizedMetadata.width as number;
      height = resizedMetadata.height as number;
    }

    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const url = await this.minioService.uploadFile(filename, finalBuffer, file.mimetype);

    const newImage = this.imageRepository.create({
      title: createDto.title,
      url,
      width,
      height,
    });

    return this.imageRepository.save(newImage);
  }
}
