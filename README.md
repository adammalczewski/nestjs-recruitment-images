## Description

A NestJS application for image management, featuring image processing, Minio storage, and PostgreSQL persistence.

## Features

- **Image Upload**: Upload images with titles.
- **Image Processing**: Optional resizing (width/height) using Sharp.
- **Storage**: Images are stored in Minio (S3-compatible storage).
- **Metadata**: Image metadata (dimensions, URL) is stored in PostgreSQL.
- **API Documentation**: Full Swagger documentation for all endpoints.
- **Validation**: Strict input validation using class-validator.

## Infrastructure

The project uses Docker Compose to run required services:
- **PostgreSQL**: For metadata storage.
- **Minio**: For image file storage.

To start the infrastructure:
```bash
$ docker-compose up -d
```

## Installation

```bash
$ npm ci
```

## Configuration

Create a `.env` file in the root directory by copying the `sample.env` file:
```bash
$ cp sample.env .env
```
Ensure the environment variables match your Docker setup.

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

The application will be available at `http://localhost:3000`.
Swagger UI is available at `http://localhost:3000/api`.

## Migrations

### Generate a migration
To generate a migration based on entity changes:
```bash
$ npm run migration:generate src/migrations/<name-of-migration>
```

### Run migrations
To run pending migrations:
```bash
$ npm run migration:run
```

### Revert migrations
To revert the last migration:
```bash
$ npm run migration:revert
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```