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
  let categoryService: CategoryService;
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
    it(`/POST invalid category because name cannot be null`, () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          name: '',
          description: 'descripcion de categoria Frutas',
        })
        .expect(400);
    });
    it(`/POST invalid category because description cannot be null`, () => {
      return request(app.getHttpServer())
        .post('/categories')
        .send({
          name: 'Verduras',
          description: '',
        })
        .expect(400);
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
        .catch((e) => e);

      expect(response.body.message[0]).toEqual(error);
    });
  });
  afterAll(async () => {
    await app.close();
  });
});
