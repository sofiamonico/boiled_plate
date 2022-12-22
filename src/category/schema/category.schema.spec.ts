import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Category, CategorySchema } from './category.schema';
describe('CategorySchema', () => {
  let categorySchema: CategorySchema;
  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        MongooseModule.forRoot(
          `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@mongo:27017/boilerplate?authSource=admin`,
        ),
        MongooseModule.forFeature([
          { name: Category.name, schema: categorySchema },
        ]),
      ],
    }).compile();

    categorySchema = moduleRef.get<CategorySchema>(CategorySchema);
  });

  describe('Category', () => {
    it('should be invalid if name is empty', async () => {
      const invalidCategory = {
        name: '',
        slug: 'category1',
        description: 'descripcion de categoria',
      };
      expect(categorySchema.create(invalidCategory)).toThrow(Error);
    });
  });
});
