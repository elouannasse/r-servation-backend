import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { MongoMemoryServer } from 'mongodb-memory-server';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: UserPayload;
}

let app: INestApplication;
let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.DATABASE_URL = mongod.getUri();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true })
    .compile();

  app = moduleFixture.createNestApplication();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use((req: RequestWithUser, res: Response, next: NextFunction) => {
    req.user = {
      id: new mongoose.Types.ObjectId().toString(),
      email: 'admin@test.com',
      role: 'ADMIN',
    };
    next();
  });

  await app.init();
}, 60000);

afterAll(async () => {
  if (app) {
    await app.close();
  }
  if (mongod) {
    await mongod.stop();
  }
});

describe('Auth Registration', () => {
  it('should return 400 for invalid email', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'invalid-email',
        password: 'password123',
        name: 'John Doe',
      })
      .expect(400);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.message).toContain('Email invalide');
  });

  it('should return 400 for short password', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
      })
      .expect(400);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.message).toContain(
      'Le mot de passe doit contenir au moins 6 caractères',
    );
  });

  it('should return 400 for missing fields', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.message).toContain("L'email est requis");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.message).toContain('Le mot de passe est requis');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(res.body.message).toContain('Le nom est requis');
  });
});
