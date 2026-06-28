import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { describe, it, beforeEach, afterAll, expect, vi } from 'vitest';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Image } from '../src/images/image.entity.js';
import { MinioService } from '../src/minio/minio.service.js';

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

describe('ImageController (e2e)', () => {
  let app: INestApplication;
  
  const mockImages = [
    { id: 1, title: 'Image 1', url: 'http://localhost:3000/images/file/1.jpg', width: 100, height: 100 },
    { id: 2, title: 'Image 2', url: 'http://localhost:3000/images/file/2.jpg', width: 200, height: 200 },
  ];

  const mockImageRepository = {
    find: vi.fn().mockResolvedValue(mockImages),
    findOne: vi.fn().mockImplementation(({ where: { id } }) => 
      Promise.resolve(mockImages.find(img => img.id === id))
    ),
    create: vi.fn().mockImplementation((dto) => ({ id: 3, ...dto, url: 'http://minio/bucket/3.jpg' })),
    save: vi.fn().mockImplementation((image) => Promise.resolve({ ...image, id: 3, width: 100, height: 100 })),
  };

  const mockMinioService = {
    uploadFile: vi.fn().mockResolvedValue('http://minio/bucket/3.jpg'),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getRepositoryToken(Image))
      .useValue(mockImageRepository)
      .overrideProvider(MinioService)
      .useValue(mockMinioService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /images', () => {
    it('should return a list of images', () => {
      return request(app.getHttpServer())
        .get('/images')
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toEqual(mockImages);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });

    it('should apply filters', () => {
      return request(app.getHttpServer())
        .get('/images?title=Image&page=2&limit=5')
        .expect(200)
        .expect((res) => {
          expect(mockImageRepository.find).toHaveBeenCalled();
          expect(res.body.page).toBe(2);
          expect(res.body.limit).toBe(5);
        });
    });
  });

  describe('GET /images/:id', () => {
    it('should return a single image', () => {
      return request(app.getHttpServer())
        .get('/images/1')
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(1);
          expect(res.body.title).toBe('Image 1');
        });
    });

    it('should return 404 if image not found', () => {
      return request(app.getHttpServer())
        .get('/images/999')
        .expect(404);
    });

    it('should return 400 if id is not a number', () => {
      return request(app.getHttpServer())
        .get('/images/abc')
        .expect(400);
    });
  });

  describe('POST /images', () => {
    it('should upload an image', async () => {
      const buffer = Buffer.from('fake image data');
      
      return request(app.getHttpServer())
        .post('/images')
        .attach('image', buffer, 'test.jpg')
        .field('title', 'New Uploaded Image')
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('New Uploaded Image');
          expect(res.body.id).toBe(3);
        });
    });

    it('should upload image with resize dimensions', async () => {
        const buffer = Buffer.from('fake image data');
        
        return request(app.getHttpServer())
          .post('/images')
          .attach('image', buffer, 'test.jpg')
          .field('title', 'Resized Image')
          .field('width', 50)
          .field('height', 50)
          .expect(201)
          .expect((res) => {
            expect(res.body.title).toBe('Resized Image');
          });
      });

    it('should return 400 if title is too short', () => {
      const buffer = Buffer.from('fake image data');
      return request(app.getHttpServer())
        .post('/images')
        .attach('image', buffer, 'test.jpg')
        .field('title', '')
        .expect(400);
    });
  });
});
