import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { Request, Response, NextFunction } from 'express';
import { AppModule } from './../src/app.module';
import mongoose from 'mongoose';
import { JwtAuthGuard } from '../src/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';

interface UserPayload {
  id: string;
  email: string;
  role: string;
}

interface RequestWithUser extends Request {
  user: UserPayload;
}

describe('Validation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
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

    // Mock CurrentUser decorator by adding user to request
    app.use((req: RequestWithUser, res: Response, next: NextFunction) => {
      req.user = {
        id: new mongoose.Types.ObjectId().toString(),
        email: 'admin@test.com',
        role: 'ADMIN',
      };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  describe('Auth Registration', () => {
    it('should return 400 for invalid email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'John Doe',
        })
        .expect(400)
        .expect((res) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          expect(res.body.message).toContain('Email invalide');
        });
    });
  });

  it('should return 400 for short password', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test@example.com',
        password: '123',
        name: 'John Doe',
      })
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain(
          'Le mot de passe doit contenir au moins 6 caractères',
        );
      });
  });

  it('should return 400 for missing fields', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({})
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain("L'email est requis");
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('Le mot de passe est requis');
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('Le nom est requis');
      });
  });
});

describe('Event Creation', () => {
  it('should return 400 for past date', () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Event',
        description: 'Description',
        date: pastDate.toISOString(),
        location: 'Location',
        capacity: 10,
      })
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('La date doit être dans le futur');
      });
  });

  it('should return 400 for negative capacity', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Event',
        description: 'Description',
        date: futureDate.toISOString(),
        location: 'Location',
        capacity: -5,
      })
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('La capacité doit être au moins 1');
      });
  });

  it('should return 400 for invalid capacity type', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Event',
        description: 'Description',
        date: futureDate.toISOString(),
        location: 'Location',
        capacity: 'beaucoup',
      })
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain('La capacité doit être un nombre');
      });
  });
});

describe('Reservation Creation', () => {
  it('should return 400 for invalid eventId (MongoId)', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return request(app.getHttpServer())
      .post('/reservations')
      .send({
        eventId: 'invalid-id',
      })
      .expect(400)
      .expect((res) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        expect(res.body.message).toContain(
          "L'ID de l'événement doit être un ObjectId valide",
        );
      });
  });
});
