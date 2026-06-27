import { DataSource } from 'typeorm';
import { Image } from './images/image.entity.js';
import { validate } from './config/env.validation.js';
import * as dotenv from 'dotenv';

dotenv.config();
validate(process.env);

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT as string, 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: true,
  entities: [Image],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
