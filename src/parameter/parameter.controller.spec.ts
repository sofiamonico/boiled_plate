import { ParameterService } from './parameter.service';
import { configParameterSchema } from './schema/schema-config';
import { Parameter } from 'src/parameter/schema/parameter.schema';
import { ParameterController } from './parameter.controller';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DBTestService } from 'test/utils/db-test.service';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Category } from 'src/category/schema/category.schema';
import { configCategorySchema } from 'src/category/schema/schema-config';
import { CategoryService } from 'src/category/category.service';
import * as request from 'supertest';

describe('ParameterController', () => {
  let dbTestService: DBTestService;
  let parameterController: ParameterController;
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo:27017/test?authSource=admin`,
        ),
        MongooseModule.forFeatureAsync([
          {
            name: Parameter.name,
            imports: [Connection],
            inject: [getConnectionToken()],
            useFactory: configParameterSchema,
          },
        ]),
        MongooseModule.forFeatureAsync([
          {
            name: Category.name,
            imports: [Connection],
            inject: [getConnectionToken()],
            useFactory: configCategorySchema,
          },
        ]),
      ],
      controllers: [ParameterController],
      providers: [DBTestService, ParameterService, CategoryService],
    }).compile();

    parameterController =
      moduleRef.get<ParameterController>(ParameterController);
    dbTestService = moduleRef.get<DBTestService>(DBTestService);
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  beforeEach(async () => {
    await dbTestService.clearDB();
  });
  it('should be defined', () => {
    expect(parameterController).toBeDefined();
    expect(dbTestService).toBeDefined();
  });
  describe('CreateParameter', () => {
    it('/POST parameter', async () => {
      const now = new Date();
      const category = await dbTestService.createCategory();
      const validParameter = {
        default: 'Algo por default',
        name: 'nombre parametro',
        description: 'una descripcion de parrametro',
      };

      const response = await request(app.getHttpServer())
        .post('/parameters')
        .send({
          default: validParameter.default,
          name: validParameter.name,
          category: category.slug,
          description: validParameter.description,
        })
        .expect(201);

      expect(response.body.name).toEqual(validParameter.name);
      expect(response.body.description).toEqual(validParameter.description);
      expect(response.body.slug).toEqual('nombre_parametro');
      expect(response.body.default).toEqual(validParameter.default);
      expect(response.body.value).toEqual(validParameter.default);
      expect(new Date(response.body.created_at) >= now).toBe(true);
      expect(new Date(response.body.updated_at) >= now).toBe(true);
    });
  });
  describe('findAll', () => {
    it('should show paginated data', async () => {
      await dbTestService.createParameters();

      const response = await request(app.getHttpServer())
        .get('/parameters?page=1&page_size=1')
        .expect(200);

      expect(response.body['X-pagination-current-page']).toEqual(1);
      expect(response.body['X-pagination-page-count']).toEqual(2);
      expect(response.body['X-pagination-page-size']).toEqual(1);
      expect(response.body['X-pagination-total-count']).toEqual(2);
      expect(response.body.data.length).toEqual(1);
    });
  });
  describe('Validations', () => {
    it.each([
      {
        variables: {
          default: 'Algo por default',
          name: '',
          description: 'una descripcion de parrametro',
        },
        error: 'name should not be empty',
      },
      {
        variables: {
          default: 'Algo por default',
          name: [1, 2, 3, 4, 5],
          description: 'una descripcion de parrametro',
        },
        error: 'name must be a string',
      },
      {
        variables: {
          default: 'Algo por default',
          name: 'la',
          description: 'una descripcion de parrametro',
        },
        error: 'name must be longer than or equal to 5 characters',
      },
      {
        variables: {
          default: 'Algo por default',
          name: 'l'.repeat(51),
          description: 'una descripcion de parrametro',
        },
        error: 'name must be shorter than or equal to 50 characters',
      },
      {
        variables: {
          default: '',
          name: 'nombre parametro',
          description: 'una descripcion de parrametro',
        },
        error: 'default should not be empty',
      },
      {
        variables: {
          default: [1, 2, 3],
          name: 'nombre parametro',
          description: 'una descripcion de parrametro',
        },
        error: 'default must be a string',
      },
      {
        variables: {
          default: 'Algo por default',
          name: 'nombre parametro',
          description: [1, 2, 3],
        },
        error: 'description must be a string',
      },
      {
        variables: {
          default: 'Algo por default',
          name: 'nombre parametro',
          description: 'u',
        },
        error: 'description must be longer than or equal to 10 characters',
      },
      {
        variables: {
          default: 'Algo por default',
          name: 'nombre parametro',
          description: 'u'.repeat(254),
        },
        error: 'description must be shorter than or equal to 253 characters',
      },
      {
        variables: {
          default: 'Algo por default',
          category: [1, 2, 3],
          name: 'nombre parametro',
          description: 'una descripcion de un parametro',
        },
        error: 'category must be a string',
      },
    ])('returns error: $error', async ({ variables, error }) => {
      const category = await dbTestService.createCategory();
      const response = await request(app.getHttpServer())
        .post('/parameters')
        .send({
          default: variables.default,
          name: variables.name,
          category: variables.category ? variables.category : category.slug,
          description: variables.description,
        })
        .expect(400);

      expect(response.body['errors'][0][0]).toEqual(error);
    });
  });
});
