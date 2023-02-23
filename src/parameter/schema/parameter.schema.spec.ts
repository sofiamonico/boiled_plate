import { ConfigModule } from '@nestjs/config';
import {
  getConnectionToken,
  getModelToken,
  MongooseModule,
} from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Connection, Model } from 'mongoose';
import { configParameterSchema } from './schema-config';
import { DBTestService } from '../../../test/utils/db-test.service';
import { Parameter, ParameterDocument } from './parameter.schema';
import { Category } from '../../category/schema/category.schema';
import { configCategorySchema } from '../../category/schema/schema-config';
import { ParameterService } from '../parameter.service';
import { CategoryService } from 'src/category/category.service';

describe('ParameterSchema', () => {
  let dbTestService: DBTestService;
  let parameterModel: Model<ParameterDocument>;

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
      providers: [DBTestService, ParameterService, CategoryService],
    }).compile();

    parameterModel = moduleRef.get<Model<ParameterDocument>>(
      getModelToken(Parameter.name),
    );
    dbTestService = moduleRef.get<DBTestService>(DBTestService);
  });

  beforeEach(async () => {
    await dbTestService.clearDB();
  });

  it('should be defined', () => {
    expect(parameterModel).toBeDefined();
    expect(dbTestService).toBeDefined();
  });

  describe('Parameter', () => {
    it('should create a correct Parameter', async () => {
      const now = new Date();
      const category = await dbTestService.createCategory();
      const parameter = {
        default: 'Parametro por default',
        name: 'Parametro prueba',
        category: category._id,
        description: 'una descripcion de un parametro',
      };
      await parameterModel.create(parameter);

      const foundParameter = await parameterModel
        .findOne({
          name: parameter.name,
        })
        .populate('category');

      expect(foundParameter.name).toEqual(parameter.name);
      expect(foundParameter.default).toEqual(parameter.default);
      expect(foundParameter.value).toEqual(parameter.default);
      expect(foundParameter.description).toEqual(parameter.description);
      expect(foundParameter.slug).toEqual('parametro_prueba');
      expect(foundParameter.created_at >= now).toBe(true);
      expect(foundParameter.updated_at >= now).toBe(true);
      expect(foundParameter.category._id).toEqual(category._id);
    });
  });
  describe('Error cases', () => {
    it.each([
      {
        variables: {
          default: 'Parametro por default',
          category: '',
          description: 'una descripcion de un parametro',
        },
        error: 'property name has failed the following constraints',
      },
      {
        variables: {
          name: 'Parametro prueba',
          category: '',
          description: 'una descripcion de un parametro',
        },
        error: 'property default has failed the following constraints',
      },
      {
        variables: {
          name: 'Parametro prueba',
          default: [1, 2, 3, 4],
          category: '',
          description: 'una descripcion de un parametro',
        },
        error: 'Parameter validation failed: default',
      },
      {
        variables: {
          name: [1, 2, 3, 4],
          default: 'Parametro prueba',
          category: '',
          description: 'una descripcion de un parametro',
        },
        error: 'Parameter validation failed: name',
      },
      {
        variables: {
          name: 'Lo',
          default: 'Parametro prueba',
          category: '',
          description: 'una descripcion de un parametro',
        },
        error: 'property name has failed the following constraints: minLength',
      },
      {
        variables: {
          name: 's'.repeat(51),
          default: 'Parametro prueba',
          category: '',
          description: 'una descripcion de un parametro',
        },
        error: 'property name has failed the following constraints: maxLength',
      },
      {
        variables: {
          name: 'Parametro prueba',
          default: 'Parametro prueba',
          category: '',
          description: 'Lo',
        },
        error:
          'property description has failed the following constraints: minLength',
      },
      {
        variables: {
          name: 'Parametro prueba',
          default: 'Parametro prueba',
          category: '',
          description: 'L'.repeat(254),
        },
        error:
          'property description has failed the following constraints: maxLength',
      },
      {
        variables: {
          name: 'Parametro prueba',
          default: 'Parametro prueba',
          category: '',
          description: [1, 2, 3, 4, 5],
        },
        error:
          'Parameter validation failed: description: Cast to string failed',
      },
    ])('returns error: $error', async ({ variables, error }) => {
      const category = await dbTestService.createCategory();
      if (variables.category === '') {
        variables.category = category._id;
      }

      const parameter = await parameterModel.create(variables).catch((e) => e);
      expect(parameter.message).toContain(error);
    });
  });
});
