import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthDto, LoginDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from '../src/bookmark/dto';
import { parse } from 'path';

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
    describe('register', () => {
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
          .stores('user_token', 'data');
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
      const dto: EditUserDto = {
        firstName: 'jojo',
        lastName: 'jaja',
      };
      it('should edit User', () => {
        return pactum
          .spec()
          .patch('users')
          .withBody(dto)
          .withHeaders({
            Authorization: 'Bearer $S{user_token}',
          })
          .expectStatus(200);
      });
    });
  });

  describe('Bookmarks', () => {
    describe('Get bookmarks', () => {
      it('should get empty bookmarks', () => {
        return pactum.spec().get('bookmarks').expectStatus(200).withHeaders({
          Authorization: 'Bearer $S{user_token}',
        });
      });
    });
    describe('Create bookmark', () => {
      const dto: CreateBookmarkDto = {
        title: 'nest js docs',
        description: 'documentation for nest js',
        link: 'https://docs.nestjs.com/modules#modules',
      };
      it('should create bookmark ', () => {
        return pactum
          .spec()
          .withBody(dto)
          .post('bookmarks')
          .expectStatus(201)
          .withHeaders({
            Authorization: 'Bearer $S{user_token}',
          })
          .stores('bookmark_id', 'id');
      });
    });
    describe('Get bookmark by id  ', () => {
      it('should get bookmark by id', () => {
        return pactum
          .spec()
          .get('bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .expectStatus(200)
          .withHeaders({
            Authorization: 'Bearer $S{user_token}',
          })
          .expectBodyContains('$S{bookmark_id}');
      });
    });

    describe('Edit bookmark by id', () => {
      const dto: EditBookmarkDto = {
        title:
          'Kubernetes Course - Full Beginners Tutorial (Containerize Your Apps!)',
        description:
          'Learn how to use Kubernetes in this complete course. Kubernetes makes it possible to containerize applications and simplifies app deployment to production.',
      };
      it('should edit bookmark', () => {
        return pactum
          .spec()
          .patch('bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{user_token}',
          })
          .withBody(dto)
          .expectStatus(200)
          .inspect()
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete bookmark by id', () => {
      it('should delete bookmark', () => {
        return pactum
          .spec()
          .delete('bookmarks/{id}')
          .withPathParams('id', '$S{bookmark_id}')
          .withHeaders({
            Authorization: 'Bearer $S{user_token}',
          })
          .expectStatus(204);
      });

      // it('should get empty bookmarks', () => {
      //   return pactum
      //     .spec()
      //     .get('/bookmarks')
      //     .withHeaders({
      //       Authorization: 'Bearer $S{user_token}',
      //     })
      //     .expectStatus(200)
      //     .expectJsonLength(0);
      // });
    });
  });
});
