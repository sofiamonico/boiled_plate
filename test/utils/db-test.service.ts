import {
  Parameter,
  ParameterDocument,
} from 'src/parameter/schema/parameter.schema';
import { Injectable } from '@nestjs/common';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import {
  Category,
  CategoryDocument,
} from '../../src/category/schema/category.schema';
import { ParameterService } from 'src/parameter/parameter.service';

@Injectable()
export class DBTestService {
  constructor(
    @InjectConnection() private connection: Connection,
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
    @InjectModel(Parameter.name)
    private parameterModel: Model<ParameterDocument>,
    private readonly parameterService: ParameterService,
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

  findCategoryWithDelete(id: string) {
    return this.categoryModel.findById(id);
  }

  createCategory() {
    const category = {
      name: 'Frutas Invernales',
      description: 'Una descripcion de una categoria',
    };
    return this.categoryModel.create(category);
  }

  createCategories() {
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
    return this.categoryModel.insertMany(categories);
  }
  async createParameters() {
    await this.createCategory();
    const parameters = [
      {
        default: 'Algo por default',
        name: 'name parametro',
        category: 'frutas_invernales',
        description: 'una descripcion de parrametro',
      },
      {
        default: 'Algo por default',
        name: 'nombre de parametro',
        category: 'frutas_invernales',
        description: 'una descripcion de parrametro',
      },
    ];

    await this.parameterService.create(parameters[0]);
    await this.parameterService.create(parameters[1]);
  }
}
