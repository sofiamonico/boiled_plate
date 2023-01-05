import { Pagination } from './../../src/category/pagination/pagination.dto';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { CategoryService } from '../../src/category/category.service';
import {
  Category,
  CategorySchema,
} from '../../src/category/schema/category.schema';
import { DBTestService } from './db-test.service';

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
    it('should be created a category', async () => {
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
      const pagination = {
        page: 1,
        page_size: 1,
        skip: 0,
      };
      const response = await categoryService.findAll(pagination);
      expect(response).toEqual(null);
    });
    it('should show paginated data', async () => {
      dbTestService.populateDB();
      const pagination = {
        page: 1,
        page_size: 1,
        skip: 0,
      };
      const response = await categoryService.findAll(pagination);
    });
  });
});
