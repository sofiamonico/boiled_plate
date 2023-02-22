import { Filter } from './dto/filter.dto';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { ParameterDocument } from './schema/parameter.schema';
import { Parameter } from 'src/parameter/schema/parameter.schema';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { CategoryService } from 'src/category/category.service';
import { Pagination } from 'src/utils/pagination/pagination.dto';
import { PaginatedResponse } from 'src/types/pagination.types';
import { SlugDto } from './dto/slug.dto';

@Injectable()
export class ParameterService {
  constructor(
    @InjectModel(Parameter.name)
    private parameterModel: Model<ParameterDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  /**
   *method that create a parameter
   * @param {CreateParameterDto} createParameter
   * @returns {Parameter} created parameter
   */
  async create(createParameter: CreateParameterDto): Promise<Parameter> {
    const category = await this.categoryService.findOneBySlug(
      createParameter.category,
    );

    if (category) {
      const parameter = new this.parameterModel({
        default: createParameter.default,
        name: createParameter.name,
        category: category._id,
        description: createParameter.description,
      });
      this.categoryService.addParameter(category._id, parameter._id);
      return parameter.save() as any;
    }
  }

  /**
   * method that brings all parameters with pagination and filters
   * @param {Pagination} pagination
   * @param {Filter} filterParams
   * @returns {Promise<PaginatedResponse<Parameter>>}
   */
  async findAll(
    pagination: Pagination,
    filterParams: Filter,
  ): Promise<PaginatedResponse<Parameter>> {
    const buildFilter = await this.buildCategoryFilter(filterParams);
    const data = await this.parameterModel
      .aggregate([
        {
          $facet: {
            totalCount: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
            data: [
              {
                $match: {
                  ...buildFilter,
                  delete_at: null,
                },
              },
              { $sort: { created_at: -1 } },
              { $skip: pagination.skip },
              { $limit: pagination.page_size },
            ],
          },
        },
      ])
      .exec();

    return pagination.buildPaginatedResponse(data);
  }

  async findOneBySlug(slugFilter: SlugDto): Promise<any> {
    const parameter = (await this.parameterModel.findOne({
      slug: slugFilter.slug,
      delete_at: null,
    })) as any;
    if (parameter) {
      return parameter;
    }

    throw new HttpException(
      'The specified parameter was not found',
      HttpStatus.CONFLICT,
    );
  }

  /**
   * method that building a new filters
   * @param {Filter} filters
   * @returns {Filter} filters
   */
  private async buildCategoryFilter(filters: Filter): Promise<any> {
    const newFilter = {};
    if (filters['category'] || filters['name']) {
      if (filters['category']) {
        const category = await this.categoryService.findOneBySlug(
          filters['category'],
        );
        newFilter['category'] = category._id;
      }
      if (filters['name']) {
        newFilter['name'] = filters['name'];
      }
    }

    return newFilter;
  }
}
