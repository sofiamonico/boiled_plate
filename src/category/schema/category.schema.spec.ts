import { DBTestService } from './db-test.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import { Category, CategorySchema, CategoryDocument } from './category.schema';

describe('CategorySchema', () => {
  let dbTestService: DBTestService;
  let categoryModel: Model<CategoryDocument>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo:27017/test?authSource=admin`,
        ),
        MongooseModule.forFeature([
          { name: Category.name, schema: CategorySchema },
        ]),
      ],
      providers: [DBTestService],
    }).compile();

    categoryModel = moduleRef.get<Model<CategoryDocument>>(
      getModelToken(Category.name),
    );
    dbTestService = moduleRef.get<DBTestService>(DBTestService);
  });

  beforeEach(async () => {
    await dbTestService.clearDB();
  });

  describe('Category', () => {
    it('should be created a Category', async () => {
      const now = new Date();
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      await categoryModel.create(validCategory);
      const foundCategory = await categoryModel.findOne({
        name: validCategory.name,
      });
      expect(foundCategory).toEqual(expect.objectContaining(validCategory));
      expect(foundCategory.name).toEqual(validCategory.name);
      expect(foundCategory.description).toEqual(validCategory.description);
      expect(foundCategory.slug).toEqual('frutas');
      expect(foundCategory.created_at >= now).toBe(true);
      expect(foundCategory.updated_at >= now).toBe(true);
    });
  });
  describe('Name', () => {
    it('should reject a repeating name attribute', async () => {
      const validCategory = {
        name: 'Frutas',
        description: 'descripcion de categoria Frutas',
      };
      await categoryModel.create(validCategory);
      const response = await categoryModel
        .create(validCategory)
        .catch((e) => e);

      expect(response.message).toContain('duplicate key error');
    });
    it('should reject a null name attribute', async () => {
      const unnameCategory = {
        name: '',
        description: 'descripcion de categoria Frutas',
      };
      const response = await categoryModel
        .create(unnameCategory)
        .catch((e) => e);
      expect(response.message).toContain(' Path `name` is required.');
    });
    it('should reject, because name is LT 3 characters', async () => {
      const invalidCategory = {
        name: 'Lo',
        description: 'descripcion de categoria incorrecta con 2 caracteres',
      };
      const response = await categoryModel
        .create(invalidCategory)
        .catch((e) => e);
      expect(response.message).toContain(
        'is shorter than the minimum allowed length (3)',
      );
    });
    it('should reject, because name is GT 50 characters', async () => {
      const invalidCategory = {
        name: 's'.repeat(51),
        description: 'descripcion de categoria incorrecta con 2 caracteres',
      };
      const response = await categoryModel
        .create(invalidCategory)
        .catch((e) => e);
      expect(response.message).toContain(
        'is longer than the maximum allowed length (50)',
      );
    });
  });
});
