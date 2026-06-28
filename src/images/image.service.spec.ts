import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ImageService } from './image.service.js';
import { Image } from './image.entity.js';
import { ConfigService } from '@nestjs/config';
import { Like } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import sharp from 'sharp';
import { MinioService } from '../minio/minio.service.js';

const resizeMock = vi.fn().mockReturnThis();
const toBufferMock = vi.fn().mockResolvedValue(Buffer.from('resized'));
const metadataMock = vi.fn().mockResolvedValue({ width: 100, height: 100 });

vi.mock('sharp', () => {
  const sharpMock = vi.fn(() => ({
    metadata: metadataMock,
    resize: resizeMock,
    toBuffer: toBufferMock,
  }));
  return { default: sharpMock };
});

describe('ImageService', () => {
  let service: ImageService;

  const mockImageRepository = {
    find: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    save: vi.fn(),
  };

  const mockConfigService = {
    get: vi.fn(),
  };

  const mockMinioService = {
    uploadFile: vi.fn(),
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
        {
          provide: MinioService,
          useValue: mockMinioService,
        },
      ],
    }).compile();

    service = module.get<ImageService>(ImageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated images', async () => {
      const images = [{ id: 1, title: 'test', url: 'url', width: 100, height: 100 }];
      mockImageRepository.find.mockResolvedValue(images);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: images,
        page: 1,
        limit: 10,
      });
      expect(mockImageRepository.find).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
    });

    it('should apply title filter', async () => {
      mockImageRepository.find.mockResolvedValue([]);

      await service.findAll({ title: 'search', page: 1, limit: 10 });

      expect(mockImageRepository.find).toHaveBeenCalledWith({
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
      const imageUrl = 'http://minio/bucket/test.jpg';
      const savedImage = { id: 1, ...createDto, url: imageUrl, width: 100, height: 100 };
      
      mockConfigService.get.mockReturnValue(3000);
      mockMinioService.uploadFile.mockResolvedValue(imageUrl);
      mockImageRepository.create.mockReturnValue(savedImage);
      mockImageRepository.save.mockResolvedValue(savedImage);

      const result = await service.create(mockFile, createDto);

      expect(result).toEqual(savedImage);
      expect(mockMinioService.uploadFile).toHaveBeenCalled();
      expect(mockImageRepository.create).toHaveBeenCalledWith({
        title: createDto.title,
        url: imageUrl,
        width: 100,
        height: 100,
      });
      expect(mockImageRepository.save).toHaveBeenCalled();
    });

    it('should handle resizing', async () => {
      const createDto = { title: 'Resized Image', width: 50, height: 50 };
      const imageUrl = 'http://minio/bucket/resized.jpg';
      const savedImage = { id: 1, title: 'Resized Image', url: imageUrl, width: 50, height: 50 };
      
      mockConfigService.get.mockReturnValue(3000);
      mockMinioService.uploadFile.mockResolvedValue(imageUrl);
      mockImageRepository.create.mockReturnValue(savedImage);
      mockImageRepository.save.mockResolvedValue(savedImage);

      await service.create(mockFile, createDto);
      
      expect(sharp).toHaveBeenCalled();
      expect(resizeMock).toHaveBeenCalledWith(50, 50, { fit: 'inside' });
      expect(mockMinioService.uploadFile).toHaveBeenCalled();
    });
  });
});
