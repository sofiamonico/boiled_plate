import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CategoryService } from '../../src/category/category.service';
import { CategoryController } from '../../src/category/category.controller';
import {
  Category,
  CategorySchema,
} from '../../src/category/schema/category.schema';
import { DBTestService } from './db-test.service';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

describe('CategoryController', () => {
  let dbTestService: DBTestService;
  let categoryController: CategoryController;
  let app: INestApplication;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo:27017/test?authSource=admin`,
        ),
        //Cargo el modulo de Category, no hace falta que cargue el archivo de config porque solo estoy testeando el controller
        MongooseModule.forFeature([
          { name: Category.name, schema: CategorySchema },
        ]),
      ],
      controllers: [CategoryController],
      providers: [DBTestService, CategoryService],
    }).compile();

    categoryController = moduleRef.get<CategoryController>(CategoryController);
    dbTestService = moduleRef.get<DBTestService>(DBTestService);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });
  beforeEach(async () => {
    await dbTestService.clearDB();
  });
  it('should be defined', () => {
    expect(categoryController).toBeDefined();
    expect(dbTestService).toBeDefined();
  });
  describe('create a Category', () => {
    it(`/POST category`, async () => {
      const now = new Date();
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: validCategory.name,
          description: validCategory.description,
        })
        .expect(201);
      expect(response.body.name).toEqual(validCategory.name);
      expect(response.body.description).toEqual(validCategory.description);
      expect(response.body.slug).toEqual('frutas');
      expect(new Date(response.body.created_at) >= now).toBe(true);
      expect(new Date(response.body.updated_at) >= now).toBe(true);
    });
  });
  describe('Validations', () => {
    it.each([
      {
        variables: { name: '', description: 'descripcion de categoria Frutas' },
        error: 'name should not be empty',
      },
      {
        variables: { name: 'Verduras', description: '' },
        error: 'description should not be empty',
      },
      {
        variables: {
          name: 'Ve',
          description: 'descripcion de categoria Frutas',
        },
        error: 'name must be longer than or equal to 3 characters',
      },
      {
        variables: {
          name: 'Pepinos',
          description: 'descripcion',
        },
        error: 'description must be longer than or equal to 20 characters',
      },
      {
        variables: {
          name: 'a'.repeat(51),
          description: 'descripcion super interesante',
        },
        error: 'name must be shorter than or equal to 50 characters',
      },
      {
        variables: {
          name: 'Sandias',
          description: 'd'.repeat(71),
        },
        error: 'description must be shorter than or equal to 70 characters',
      },
      {
        variables: {
          name: [1, 2, 3, 4, 5],
          description: 'descripcion super interesante',
        },
        error: 'name must be a string',
      },
      {
        variables: {
          name: 'Frutas interesantes',
          description: [1, 2, 3, 4, 5],
        },
        error: 'description must be a string',
      },
    ])('returns error: $error', async ({ variables, error }) => {
      const response = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: variables.name,
          description: variables.description,
        })
        .expect(400);
      expect(response.body['errors'][0][0]).toEqual(error);
    });
  });
  describe('findAll Categories', () => {
    it('should show paginated data', async () => {
      await dbTestService.createCategories();

      const response = await request(app.getHttpServer())
        .get('/categories?page=1&page_size=1')
        .expect(200);

      expect(response.body['X-pagination-current-page']).toEqual(1);
      expect(response.body['X-pagination-page-count']).toEqual(4);
      expect(response.body['X-pagination-page-size']).toEqual(1);
      expect(response.body['X-pagination-total-count']).toEqual(4);
      expect(response.body.data.length).toEqual(1);
    });
    it('should show a page and a page size of 20, because the parameters if null', async () => {
      await dbTestService.createCategories();

      const response = await request(app.getHttpServer())
        .get('/categories')
        .expect(200);

      expect(response.body['X-pagination-current-page']).toEqual(1);
      expect(response.body['X-pagination-page-count']).toEqual(1);
      expect(response.body['X-pagination-page-size']).toEqual(20);
      expect(response.body['X-pagination-total-count']).toEqual(4);
      expect(response.body.data.length).toEqual(4);
    });
  });
  describe('findOneById Category', () => {
    it('should show a category by id of type UUID4', async () => {
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      const newCategory = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: validCategory.name,
          description: validCategory.description,
        });

      const response = await request(app.getHttpServer())
        .get(`/categories/id=${newCategory.body._id}`)
        .expect(200);

      expect(response.body[0]).toEqual(expect.objectContaining(validCategory));
    });
    it('should show a error because the id is not a type UUID4', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/id=${123455}`)
        .expect(400);

      expect(response.body['errors'][0]).toContain('uuid is expected');
    });
    it('should show a array empty because the id not exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/id=${'b730b6a2-1769-461f-8cef-6da06b32c151'}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
  describe('findOneBySlug', () => {
    it('should show a category by slug', async () => {
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      const newCategory = await request(app.getHttpServer())
        .post('/categories')
        .send({
          name: validCategory.name,
          description: validCategory.description,
        });

      const response = await request(app.getHttpServer())
        .get(`/categories/slug=${newCategory.body.slug}`)
        .expect(200);

      expect(response.body[0]).toEqual(expect.objectContaining(validCategory));
    });
    it('should show a array empty because the slug not exists', async () => {
      const response = await request(app.getHttpServer())
        .get(`/categories/slug=frutas`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
