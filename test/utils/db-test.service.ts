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

  //method to clean the database
  clearDB() {
    return this.connection.db.dropDatabase();
  }

  //method to delete a category but without removing it from the database
  delete(name: string) {
    return this.categoryModel.updateOne(
      { name: name },
      { $addToSet: { delete_at: new Date() } },
    );
  }

  populateDB() {
    const categories = [
      {
        name: 'Frutas Invernales',
        description: 'Una descripcion de una categoria',
      },
      {
        name: 'Frutas Veraniegas',
        description: 'Una descripcion de una categoria',
      },
      {
        name: 'Frutas Primaverales',
        description: 'Una descripcion de una categoria',
      },
      {
        name: 'Frutas Otoñales',
        description: 'Una descripcion de una categoria',
      },
    ];
    categories.forEach((categoria) => {
      const resp = this.categoryModel.create(categoria);
      console.log(
        '🚀 ~ file: db-test.service.ts:50 ~ DBTestService ~ categories.forEach ~ resp',
        resp,
      );
    });
  }
}
