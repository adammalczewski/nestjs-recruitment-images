import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageService } from './image.service.js';
import { Image } from './image.entity.js';
import { ConfigService } from '@nestjs/config';
import { Repository, Like } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import sharp from 'sharp';

const resizeMock = vi.fn().mockReturnThis();
const toBufferMock = vi.fn().mockResolvedValue(Buffer.from('resized'));
const metadataMock = vi.fn().mockResolvedValue({ width: 100, height: 100 });

vi.mock('sharp', () => {
  const sharpMock = vi.fn((buffer) => ({
    metadata: metadataMock,
    resize: resizeMock,
    toBuffer: toBufferMock,
  }));
  return { default: sharpMock };
});

describe('ImageService', () => {
  let service: ImageService;
  let repository: Repository<Image>;
  let configService: ConfigService;

  const mockImageRepository = {
    findAndCount: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImageService,
        {
          provide: getRepositoryToken(Image),
          useValue: mockImageRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
    repository = module.get<Repository<Image>>(getRepositoryToken(Image));
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated images', async () => {
      const images = [{ id: 1, title: 'test', url: 'url', width: 100, height: 100 }];
      const total = 1;
      mockImageRepository.findAndCount.mockResolvedValue([images, total]);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: images,
        total,
        page: 1,
        limit: 10,
      });
      expect(mockImageRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
    });

    it('should apply title filter', async () => {
      mockImageRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll({ title: 'search', page: 1, limit: 10 });

      expect(mockImageRepository.findAndCount).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
        where: {
          title: Like('%search%'),
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return an image if found', async () => {
      const image = { id: 1, title: 'test', url: 'url', width: 100, height: 100 };
      mockImageRepository.findOne.mockResolvedValue(image);

      const result = await service.findOne(1);

      expect(result).toEqual(image);
      expect(mockImageRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if image not found', async () => {
      mockImageRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const mockFile = {
      buffer: Buffer.from('test'),
      originalname: 'test.jpg',
      mimetype: 'image/jpeg',
    } as Express.Multer.File;

    it('should create and save an image', async () => {
      const createDto = { title: 'New Image' };
      const savedImage = { id: 1, ...createDto, url: 'http://localhost:3000/images/file/', width: 100, height: 100 };
      
      mockConfigService.get.mockReturnValue(3000);
      mockImageRepository.create.mockReturnValue(savedImage);
      mockImageRepository.save.mockResolvedValue(savedImage);

      const result = await service.create(mockFile, createDto);

      expect(result).toEqual(savedImage);
      expect(mockImageRepository.create).toHaveBeenCalledWith({
        title: createDto.title,
        url: 'http://localhost:3000/images/file/',
        width: 100,
        height: 100,
      });
      expect(mockImageRepository.save).toHaveBeenCalled();
    });

    it('should handle resizing', async () => {
      const createDto = { title: 'Resized Image', width: 50, height: 50 };
      const savedImage = { id: 1, title: 'Resized Image', url: 'http://localhost:3000/images/file/', width: 50, height: 50 };
      
      // We need to mock metadata for the second sharp call (resizedMetadata)
      // Our mock currently returns 100,100. Let's adjust it or just check if resize was called.
      
      mockConfigService.get.mockReturnValue(3000);
      mockImageRepository.create.mockReturnValue(savedImage);
      mockImageRepository.save.mockResolvedValue(savedImage);

      await service.create(mockFile, createDto);
      
      expect(sharp).toHaveBeenCalled();
      expect(resizeMock).toHaveBeenCalledWith(50, 50, { fit: 'inside' });
    });
  });
});
