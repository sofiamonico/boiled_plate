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
import { configParameterSchema } from './schema/schema-config';
import { plainToInstance } from 'class-transformer';
import { Pagination } from 'src/utils/pagination/pagination.dto';
import { Filter } from './dto/filter.dto';
import { SlugDto } from './dto/slug.dto';

describe('ParameterService', () => {
  let dbTestService: DBTestService;
  let parameterService: ParameterService;
  let categoryService: CategoryService;

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

    dbTestService = moduleRef.get<DBTestService>(DBTestService);
    parameterService = moduleRef.get<ParameterService>(ParameterService);
    categoryService = moduleRef.get<CategoryService>(CategoryService);
  });

  beforeEach(async () => {
    await dbTestService.clearDB();
  });
  //Testeo si los services fueron definidos correctamente
  it('should be defined', () => {
    expect(parameterService).toBeDefined();
    expect(dbTestService).toBeDefined();
  });
  describe('CreateParameter', () => {
    it('should create a correct parameter', async () => {
      const category = await dbTestService.createCategory();

      const validParameter = {
        default: 'Algo por default',
        name: 'nombre parametro',
        category: category.slug,
        description: 'una descripcion de parrametro',
      };
      const parameter = await parameterService.create(validParameter);
      expect(parameter.default).toContain(validParameter.default);
      expect(parameter.value).toContain(validParameter.default);
      expect(parameter.name).toContain(validParameter.name);
      expect(parameter.slug).toContain('nombre_parametro');
      expect(parameter.category).toContain(category._id);
      expect(parameter.description).toContain(validParameter.description);
    });
    it('should create parameter with slug enumerated with 1 because the slug already exist', async () => {
      const category = await dbTestService.createCategory();
      const validParameter = {
        default: 'Algo por default',
        name: 'nombre parametro',
        category: category.slug,
        description: 'una descripcion de parrametro',
      };
      await parameterService.create(validParameter);
      const parameter = await parameterService.create(validParameter);
      expect(parameter.slug).toContain('nombre_parametro1');
    });
    it('should create parameter with slug enumerated with 2 because the slug already exist', async () => {
      const category = await dbTestService.createCategory();
      const validParameter = {
        default: 'Algo por default',
        name: 'nombre parametro',
        category: category.slug,
        description: 'una descripcion de parrametro',
      };
      await parameterService.create(validParameter);
      await parameterService.create(validParameter);
      const parameter = await parameterService.create(validParameter);
      expect(parameter.slug).toContain('nombre_parametro2');
    });
    it('should rejected because the specified category was not found', async () => {
      const validParameter = {
        default: 'Algo por default',
        name: 'nombre parametro',
        category: 'categoria_inextistente',
        description: 'una descripcion de parrametro',
      };
      const response = await parameterService
        .create(validParameter)
        .catch((e) => e);
      expect(response.message).toContain(
        'The specified category was not found',
      );
    });
  });
  describe('findAll', () => {
    it('should show paginated data', async () => {
      await dbTestService.createParameters();
      const pagination = plainToInstance(Pagination, {
        page: 1,
        page_size: 2,
      });
      const filters = plainToInstance(Filter, {});

      const response = await parameterService.findAll(pagination, filters);
      expect(response['X-pagination-current-page']).toEqual(1);
      expect(response['X-pagination-page-size']).toEqual(2);
      expect(response['X-pagination-total-count']).toEqual(2);
      expect(response['X-pagination-page-count']).toEqual(1);
      expect(response.data[0]['delete_at']).toEqual(undefined);
      expect(response.data.length).toEqual(2);
      expect(Object.keys(response.data[0]).length).toEqual(10);
    });

    it('should show paginated data, fileted by name', async () => {
      await dbTestService.createParameters();
      const pagination = plainToInstance(Pagination, {
        page: 1,
        page_size: 1,
      });
      const filters = plainToInstance(Filter, {
        name: 'nombre de parametro',
      });
      const response = await parameterService.findAll(pagination, filters);

      expect(response.data[0]['name']).toEqual('nombre de parametro');
      expect(response.data[0]['delete_at']).toEqual(undefined);
      expect(response.data.length).toEqual(1);
    });

    it('should show paginated data, fileted by category', async () => {
      await dbTestService.createParameters();
      const pagination = plainToInstance(Pagination, {
        page: 1,
        page_size: 2,
      });
      const filters = plainToInstance(Filter, {
        category: 'frutas_invernales',
      });
      const response = await parameterService.findAll(pagination, filters);

      const category = await categoryService.findOneById(
        response.data[0]['category'] as any,
      );
      expect(category.slug).toEqual('frutas_invernales');
      expect(response.data[0]['delete_at']).toEqual(undefined);
      expect(response.data.length).toEqual(2);
    });

    it('should show paginated data, fileted by name and category', async () => {
      await dbTestService.createParameters();
      const pagination = plainToInstance(Pagination, {
        page: 1,
        page_size: 2,
      });

      const filters = plainToInstance(Filter, {
        name: 'nombre de parametro',
        category: 'frutas_invernales',
      });

      const response = await parameterService.findAll(pagination, filters);

      const category = await categoryService.findOneById(
        response.data[0]['category'] as any,
      );

      expect(response.data[0]['name']).toEqual('nombre de parametro');
      expect(category.slug).toEqual('frutas_invernales');
      expect(response.data[0]['delete_at']).toEqual(undefined);
      expect(response.data.length).toEqual(1);
    });
    it('should first display the last parameter created', async () => {
      await dbTestService.createParameters();
      const pagination = plainToInstance(Pagination, {});

      const filters = plainToInstance(Filter, {});

      const response = await parameterService.findAll(pagination, filters);

      expect(response.data[0]['name']).toEqual('nombre de parametro');
      expect(response.data[0]['default']).toEqual('Algo por default');
      expect(response.data[0]['description']).toEqual(
        'una descripcion de parrametro',
      );
      expect(
        response.data[0]['created_at'] > response.data[1]['created_at'],
      ).toBe(true);
    });
  });
  describe('findOnebySlug', () => {
    it('should a category by slug', async () => {
      await dbTestService.createParameters();

      const slug = plainToInstance(SlugDto, { slug: 'name_parametro' });
      const parameter = await parameterService.findOneBySlug(slug);

      expect(parameter.slug).toEqual('name_parametro');
      expect(parameter.delete_at).toEqual(undefined);
    });
    it('should reject because the slug not exist', async () => {
      await dbTestService.createParameters();
      const slug = plainToInstance(SlugDto, { slug: 'nombre_falso' });
      const response = await parameterService
        .findOneBySlug(slug)
        .catch((e) => e);
      expect(response.message).toEqual('The specified parameter was not found');
    });
  });
});
