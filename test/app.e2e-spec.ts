import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import { CreateBookMarkDto, EditBookMarkDto } from '../src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true
      }));
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);

    await prisma.cleanDb()
    pactum.request.setBaseUrl('http://localhost:3333')
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    const signupUrl = '/auth/signup';
    const signinUrl = '/auth/signin';
    const dto: AuthDto = {
      email: 'aboba@gmail.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post(signupUrl)
          .withBody({ password: dto.password })
          .expectStatus(400)
      });

      it('should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post(signupUrl)
          .withBody({ email: dto.email })
          .expectStatus(400)
      });
      it('should throw exception if no body provided', () => {
        return pactum
          .spec()
          .post(signupUrl)
          .expectStatus(400)
      });

      it('Should signup', () => {
        return pactum
          .spec()
          .post(signupUrl)
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw exception if email is empty', () => {
        return pactum
          .spec()
          .post(signinUrl)
          .withBody({ password: dto.password })
          .expectStatus(400)
      });
      it('should throw exception if password is empty', () => {
        return pactum
          .spec()
          .post(signinUrl)
          .withBody({ email: dto.email })
          .expectStatus(400)
      });
      it('should throw exception if no body provided', () => {
        return pactum
          .spec()
          .post(signinUrl)
          .expectStatus(400)
      });
      const newDto = { email: dto.email, password: dto.email }
      it('should throw error if password is wrong', () => {
        return pactum
          .spec()
          .post(signinUrl)
          .withBody(newDto)
          .expectStatus(403)
      });

      it('Should signin', () => {
        return pactum
          .spec()
          .post(signinUrl)
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    const dto: EditUserDto = {
      firstName: 'Obeme',
      email: 'Obema@gmail.com'
    }
    describe('Get current user', () => {
      it('Should return current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(200);
      })
    });
    describe('Edit user', () => {
      it('Should edit user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email)
      });
    });
  });

  describe('Bookmarks', () => {
    const bookmarksUrl = '/bookmarks'
    const dto: CreateBookMarkDto = {
      title: 'new bookmark',
      link: 'page123',
      description: 'aboba'
    }
    describe('Get empty bookmarks', () => {
      it('Should get empty bookmarks', () => {
        return pactum
          .spec()
          .get(bookmarksUrl)
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(200)
          .expectBody([]);
      });
    });

    describe('Create bookmarks', () => {
      it('Should create bookmark', () => {
        return pactum
          .spec()
          .post(bookmarksUrl)
          .withBody(dto)
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get bookmarks', () => {
      it('Should get all bookmarks of current user', () => {
        return pactum
          .spec()
          .get(bookmarksUrl)
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get bookmark by id', () => {
      it('Should get bookmark by id', () => {
        return pactum
          .spec()
          .get(bookmarksUrl + '/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(200)
      });
    });

    describe('Edit bookmark', () => {
      it('Should edit bookmark by id', () => {
        const newDto: EditBookMarkDto = {
          title: 'changed title',
          description: 'Obema',
          link: 'different page',
        }
        return pactum
          .spec()
          .patch(bookmarksUrl + '/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .withBody(newDto)
          .expectStatus(200)
          .expectBodyContains(newDto.title)
          .expectBodyContains(newDto.description)
          .expectBodyContains(newDto.link)
      });
    });

    describe('Delete bookmark', () => {
      it('Should edit bookmark by id', () => {
        return pactum
          .spec()
          .delete(bookmarksUrl + '/{id}')
          .withPathParams('id', '$S{bookmarkId}')
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(204)
          .inspect()
      });

      it('Should get all bookmarks of current user', () => {
        return pactum
          .spec()
          .get(bookmarksUrl)
          .withHeaders({ Authorization: 'Bearer $S{userAt}', })
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });
  })
})