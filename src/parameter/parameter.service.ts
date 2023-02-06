import { CreateParameterDto } from './dto/create-parameter.dto';
import { ParameterDocument } from './schema/parameter.schema';
import { Parameter } from 'src/parameter/schema/parameter.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryService } from 'src/category/category.service';

@Injectable()
export class ParameterService {
  constructor(
    @InjectModel(Parameter.name)
    private parameterModel: Model<ParameterDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  async create(createParameter: CreateParameterDto) {
    const category = await this.categoryService.findOneBySlug(
      createParameter.category,
    );

    if (category) {
      const parameter = new this.parameterModel({
        default: createParameter.default,
        name: createParameter.name,
        category: category[0]._id,
        description: createParameter.description,
      });
      this.categoryService.addParameter(category[0]._id, parameter._id);
      return parameter.save() as any;
    }
  }
}
