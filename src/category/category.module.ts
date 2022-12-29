import { Category } from './schema/category.schema';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { configCategorySchema } from './schema/schema-config';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Category.name,
        imports: [Connection],
        inject: [getConnectionToken()],
        useFactory: configCategorySchema,
      },
    ]),
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoryModule {}
