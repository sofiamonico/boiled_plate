import { Pagination } from './pagination/pagination.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';

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
   * @returns {Category[]}
   */
  async findAll(pagination: Pagination) {
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

    return this.buildPaginatedResponse(pagination, data);
  }
  /**
   * method to get a category by id
   * @param {string} id
   * @returns {Category} || null
   */
  findOneById(id: string) {
    try {
      return this.categoryModel.find({ _id: id, delete_at: null });
    } catch (err) {
      return null;
    }
  }

  /**
   *method to get a category by slug
   * @param {string} slug
   * @returns {Category} || null
   */
  findOneBySlug(slug: string) {
    try {
      return this.categoryModel.find({ slug: slug, delete_at: null });
    } catch (err) {
      return null;
    }
  }

  getTotalPages(amountCategories: number, page_size: number): number {
    return Math.ceil(amountCategories / page_size);
  }

  buildPaginatedResponse(pagination: Pagination, data: any[]) {
    //capture the number of existing categories. If not exist none category,
    // amountCategories is equal to 0
    const amountCategories =
      data[0].totalCategories.length === 0
        ? 0
        : data[0].totalCategories[0].count;
    //function that calculates the total number of pages
    const amountPages = this.getTotalPages(
      amountCategories,
      pagination.page_size,
    );

    return {
      'X-pagination-total-count': amountCategories,
      'X-pagination-page-count': amountPages,
      'X-pagination-current-page': pagination.page,
      'X-pagination-page-size': pagination.page_size,
      data: data[0].categories,
    };
  }
}
