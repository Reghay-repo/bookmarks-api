import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto, LoginDto } from '../src/auth/dto';

describe('App (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);
    pactum.request.setBaseUrl('http://localhost:3333/');

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'jhon@gmail.com',
      password: '12345678',
      firstName: 'jhon',
      lastName: 'doe',
    };
    describe('login', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('auth/register')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('auth/register')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw error if no body', () => {
        return pactum.spec().post('auth/register').expectStatus(400);
      });
      it('should register', () => {
        return pactum
          .spec()
          .post('auth/register')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Log in ', () => {
      it('should throw error if email empty', () => {
        return pactum
          .spec()
          .post('auth/login')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('should throw error if password empty', () => {
        return pactum
          .spec()
          .post('auth/login')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('should throw error if no body', () => {
        return pactum.spec().post('auth/login').expectStatus(400);
      });
      it('should log in', () => {
        const dto: LoginDto = {
          email: 'jhon@gmail.com',
          password: '12345678',
        };

        return pactum
          .spec()
          .post('auth/login')
          .withBody(dto)
          .expectStatus(200)
          .stores('user_token', 'data')
          .inspect();
      });
    });
  });

  describe('User', () => {
    describe('Get user', () => {
      it('should get current user', () => {
        return pactum.spec().get('users/me').expectStatus(200).withHeaders({
          Authorization: 'Bearer $S{user_token}',
        });
      });
    });
    describe('Edit user', () => {
      it.todo('should edit User');
    });
  });

  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {
      it.todo('should get all bookmarks');
    });
    describe('Get bookmark', () => {
      it.todo('should get bookmark by id');
    });
    describe('Create bookmark', () => {
      it.todo('should create bookmark ');
    });
    describe('Edit bookmark', () => {
      it.todo('should edit bookmark ');
    });
    describe('Delete bookmark', () => {
      it.todo('should delete bookmark ');
    });
  });
});
