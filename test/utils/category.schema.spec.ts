import { DBTestService } from './db-test.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule, getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model } from 'mongoose';
import {
  Category,
  CategorySchema,
  CategoryDocument,
} from '../../src/category/schema/category.schema';

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
    it('should create a Category', async () => {
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
  describe('Slug', () => {
    it('should be like the name but in lower case and with a underscore', async () => {
      const validCategory = {
        name: 'Frutas Tropicales',
        description: 'descripcion de categoria Frutas',
      };
      await categoryModel.create(validCategory);
      const foundCategory = await categoryModel.findOne({
        name: validCategory.name,
      });
      expect(foundCategory.slug).toEqual('frutas_tropicales');
    });
    it('should reject, because slug is LT 3 characters', async () => {
      const invalidCategory = {
        name: 'Lo',
        description: 'descripcion de categoria incorrecta con 2 caracteres',
      };
      const response = await categoryModel
        .create(invalidCategory)
        .catch((e) => e);
      expect(response.message).toContain('slug: Path `slug`');
    });
    it('should reject, because slug is GT 50 characters', async () => {
      const invalidCategory = {
        name: 's'.repeat(26) + ' ' + 's ' + 's'.repeat(26),
        description: 'descripcion de categoria incorrecta con 2 caracteres',
      };
      const response = await categoryModel
        .create(invalidCategory)
        .catch((e) => e);
      expect(response.message).toContain(
        'is longer than the maximum allowed length (53)',
      );
    });
    describe('Description', () => {
      it('should reject a null describe attribute', async () => {
        const incompleteCategory = {
          name: 'Frutas tropicales',
          description: '',
        };
        const response = await categoryModel
          .create(incompleteCategory)
          .catch((e) => e);
        expect(response.message).toContain('Path `description` is required.');
      });
      it('should reject, because description is LT 20 characters', async () => {
        const incompleteCategory = {
          name: 'Frutas tropicales',
          description: 's'.repeat(19),
        };
        const response = await categoryModel
          .create(incompleteCategory)
          .catch((e) => e);
        expect(response.message).toContain(
          ' is shorter than the minimum allowed length (20)',
        );
      });
      it('should reject, because description is GT 70 characters', async () => {
        const incompleteCategory = {
          name: 'Frutas tropicales',
          description: 's'.repeat(71),
        };
        const response = await categoryModel
          .create(incompleteCategory)
          .catch((e) => e);
        expect(response.message).toContain(
          'is longer than the maximum allowed length (70).',
        );
      });
      it('should reject, because description is not a string', async () => {
        const invalidCategory = {
          name: 'Frutas tropicales',
          description: [1, 2, 3, 4, 5, 6],
        };
        const response = await categoryModel
          .create(invalidCategory)
          .catch((e) => e);
        expect(response.message).toContain('Cast to string failed for value');
      });
    });
    describe('updated_at', () => {
      it('should change, because the category is update', async () => {
        const validCategory = {
          name: 'Frutas Tropicales',
          description: 'descripcion de categoria Frutas',
        };
        const now = new Date();
        await categoryModel.create(validCategory);

        await categoryModel.findOneAndUpdate(
          { name: validCategory.name },
          { name: 'Verduras invernales' },
        );
        const foundCategory = await categoryModel.findOne({
          name: 'Verduras invernales',
        });
        expect(foundCategory.updated_at >= now).toBe(true);
      });
    });
    describe('delete_at', () => {
      it('should change, because the category is delete', async () => {
        const validCategory = {
          name: 'Frutas Tropicales',
          description: 'descripcion de categoria Frutas',
        };
        await categoryModel.create(validCategory);
        await dbTestService.delete(validCategory.name);
        const foundCategory = await categoryModel.findOne({
          name: validCategory.name,
        });
        const now = new Date();
        expect(foundCategory.delete_at <= now).toBe(true);
      });
    });
  });
});
