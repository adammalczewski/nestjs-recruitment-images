import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Documentation') // Title for the Swagger UI
    .setDescription('API description and endpoints') // Description
    .setVersion('1.0') // API version
    .addBearerAuth() // Add Bearer token for authentication (optional)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // Swagger UI will be available at /api

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running, Swagger is on: http://localhost:${port}/api`);
}

await bootstrap();
