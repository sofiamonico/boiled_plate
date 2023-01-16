import { Pagination } from '../utils/pagination/pagination.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';
import { PaginatedResponse } from '../types/pagination.types';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}
  /**
   * method that create a categoy
   * @param {CreateCategoryDto} createCategoyDto with name and description
   * @throws {HttpException} existing category
   * @returns {Category} created category
   */
  async create(createCategoyDto: CreateCategoryDto): Promise<Category> {
    const exist = await this.categoryModel.find({
      slug: createCategoyDto.name.toLowerCase().split(' ').join('_'),
    });
    if (exist.length != 0) {
      throw new HttpException(
        'This category already exists',
        HttpStatus.BAD_REQUEST,
      );
    } else {
      return this.categoryModel.create(createCategoyDto);
    }
  }

  /**
   * method that brings all categories with pagination
   * @param {Pagination} pagination,
   * @returns {Promise<PaginatedResponse<Category>>}
   */
  async findAll(pagination: Pagination): Promise<PaginatedResponse<Category>> {
    //The aggregate method is responsible
    //for bringing the filtered categories and also
    // calculating the total of the categories
    const data = await this.categoryModel
      .aggregate([
        {
          $facet: {
            totalCategories: [
              {
                $group: {
                  _id: null,
                  count: { $sum: 1 },
                },
              },
            ],
            categories: [
              { $skip: pagination.skip },
              { $limit: pagination.page_size },
            ],
          },
        },
      ])
      .exec();

    return pagination.buildPaginatedResponse(data);
  }
  /**
   * method to get a category by id
   * @param {string} id
   * @returns {Promise<Category>}
   */
  findOneById(id: string): Promise<any> {
    return this.categoryModel.find({ _id: id, delete_at: null }) as any;
  }

  /**
   *method to get a category by slug
   * @param {string} slug
   * @returns {Promise<Category>} || null
   */
  findOneBySlug(slug: string): Promise<any> {
    return this.categoryModel.find({ slug: slug, delete_at: null }) as any;
  }
}
