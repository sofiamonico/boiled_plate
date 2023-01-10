import { Pagination } from '../../src/utils/pagination/pagination.dto';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CategoryService } from '../../src/category/category.service';
import {
  Category,
  CategorySchema,
} from '../../src/category/schema/category.schema';
import { DBTestService } from './db-test.service';
import { plainToInstance } from 'class-transformer';

describe('CategoryService', () => {
  let dbTestService: DBTestService;
  let categoryService: CategoryService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo:27017/test?authSource=admin`,
        ),
        //Cargo el modulo de Category, no hace falta que cargue el archivo de config porque solo estoy testeando el service
        MongooseModule.forFeature([
          { name: Category.name, schema: CategorySchema },
        ]),
      ],
      //Me sigo trayendo el DBServices ya que es el que se encarga de limpiar la base de datos
      providers: [DBTestService, CategoryService],
    }).compile();

    dbTestService = moduleRef.get<DBTestService>(DBTestService);
    categoryService = moduleRef.get<CategoryService>(CategoryService);
  });
  beforeEach(async () => {
    await dbTestService.clearDB();
  });
  //Testeo si los services fueron definidos correctamente
  it('should be defined', () => {
    expect(categoryService).toBeDefined();
    expect(dbTestService).toBeDefined();
  });

  //Solo testeo la creacion correctta de una category y posibles casos de fallos dentro del services
  describe('Category', () => {
    it('should created a category', async () => {
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      const response = await categoryService.create(validCategory);

      expect(response.name).toEqual(validCategory.name);
      expect(response.description).toEqual(validCategory.description);
    });
    it('should reject a repeating category', async () => {
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      await categoryService.create(validCategory);
      const response = await categoryService
        .create(validCategory)
        .catch((e) => e);

      expect(response.message).toBe('This category already exists');
    });
    it('should reject a invalid category', async () => {
      const invalidCategory = {
        name: '',
        description: 'descripcion de categoria Frutas',
      };
      const response = await categoryService
        .create(invalidCategory)
        .catch((e) => e);

      expect(response.message).toContain('name: Path `name` is required.');
    });
  });

  describe('findAll Categories', () => {
    it('should show the null data but with a paginated response', async () => {
      const pagination = plainToInstance(Pagination, {
        page: 1,
        page_size: 1,
      });
      const response = await categoryService.findAll(pagination);
      expect(response['X-pagination-total-count']).toEqual(0);
      expect(response['X-pagination-page-count']).toEqual(0);
      expect(response['X-pagination-current-page']).toEqual(1);
      expect(response['X-pagination-page-size']).toEqual(1);
      expect(response.data.length).toEqual(0);
    });
    it('should show paginated data', async () => {
      await dbTestService.createCategories();
      const pagination = plainToInstance(Pagination, {
        page: 1,
        page_size: 1,
      });
      const response = await categoryService.findAll(pagination);
      expect(response['X-pagination-current-page']).toEqual(1);
      expect(response['X-pagination-page-size']).toEqual(1);
      expect(response['X-pagination-total-count']).toEqual(4);
      expect(response['X-pagination-page-count']).toEqual(4);
      expect(response.data.length).toEqual(1);
      expect(Object.keys(response.data[0]).length).toEqual(7);
    });
    it('should show a page and a page size of 20, because the parameters if null', async () => {
      await dbTestService.createCategories();
      const pagination = plainToInstance(Pagination, {});
      const response = await categoryService.findAll(pagination);

      expect(response['X-pagination-current-page']).toEqual(1);
      expect(response['X-pagination-page-size']).toEqual(20);
      expect(response['X-pagination-total-count']).toEqual(4);
      expect(response['X-pagination-page-count']).toEqual(1);
    });
  });
  describe('findOneById Categories', () => {
    it('should show a category by id of type UUID4', async () => {
      const newCategory = {
        name: 'Buenas frutas',
        description: 'Frutas de genialisima calidad',
      };
      const category = await categoryService.create(newCategory);
      const response = await categoryService.findOneById(category._id);
      expect(response[0]).toEqual(expect.objectContaining(newCategory));
    });
    it('should show a array empty because the id  not exists', async () => {
      const response = await categoryService.findOneById('123456');
      expect(response).toEqual([]);
    });
  });
  describe('findOnebySlug', () => {
    it('should a category by slug', async () => {
      const newCategory = {
        name: 'Buenas frutas',
        description: 'Frutas de genialisima calidad',
      };
      await categoryService.create(newCategory);
      const response = await categoryService.findOneBySlug('buenas_frutas');
      expect(response[0]).toEqual(expect.objectContaining(newCategory));
    });
    it('should show a array empty because the slug not exists', async () => {
      const response = await categoryService.findOneBySlug('frutas');
      expect(response).toEqual([]);
    });
  });
});
