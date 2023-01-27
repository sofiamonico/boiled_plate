import { CategoryService } from 'src/category/category.service';
import { Category } from './../category/schema/category.schema';
import { ConfigModule } from '@nestjs/config';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { DBTestService } from '../../test/utils/db-test.service';
import { ParameterService } from './parameter.service';
import { Parameter } from '../../src/parameter/schema/parameter.schema';
import { configCategorySchema } from 'src/category/schema/schema-config';
import { Connection } from 'mongoose';
import { configParameterSchemaParameter } from './schema/schema-config';

describe('ParameterService', () => {
  let dbTestService: DBTestService;
  let parameterService: ParameterService;

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
            useFactory: configParameterSchemaParameter,
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

    dbTestService = moduleRef.get<DBTestService>(DBTestService);
    parameterService = moduleRef.get<ParameterService>(ParameterService);
  });

  beforeEach(async () => {
    await dbTestService.clearDB();
  });
  //Testeo si los services fueron definidos correctamente
  it('should be defined', () => {
    expect(parameterService).toBeDefined();
    expect(dbTestService).toBeDefined();
  });
  describe('CreateCategory', () => {
    it('should create a correct parameter', async () => {
      const category = await dbTestService.createCategory();
      const validParameter = {
        default: 'Algo por default',
        name: 'nombre parametro',
        category: category.slug,
        description: 'una descripcion de parrametro',
      };

      const parameter = await parameterService.create(validParameter);
      expect(parameter).toContain(validParameter);
    });
  });
});
