import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './image.entity.js';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  async findAll(): Promise<Image[]> {
    return this.imageRepository.find();
  }

  async create(image: Partial<Image>): Promise<Image> {
    const newImage = this.imageRepository.create(image);
    return this.imageRepository.save(newImage);
  }
}
