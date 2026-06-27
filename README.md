## Description

Empty NestJS application

## Installation

```bash
$ npm ci
```

## Configuration

Create a `.env` file in the root directory and configure your database settings:
```env
DB_HOST=127.0.0.1
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=recruitment-images
PORT=3000
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

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

### Create a migration
To create an empty migration file:
```bash
$ npm run migration:create src/migrations/<name-of-migration>
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