import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../../src/category/schema/category.schema';

@Injectable()
export class DBTestService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  clearDB() {
    return this.connection.db.dropDatabase();
  }

  delete(name: string) {
    return this.categoryModel.updateOne(
      { name: name },
      { $addToSet: { delete_at: new Date() } },
    );
  }
}
