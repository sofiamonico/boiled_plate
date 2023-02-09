import { Pagination } from '../utils/pagination/pagination.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateCategoryDto } from './dto/create-category.dto';
import { Category, CategoryDocument } from './schema/category.schema';
import { PaginatedResponse } from '../types/pagination.types';
import { UpdateCategoryDto } from './dto/update-category.dto';

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
              {
                $match: {
                  delete_at: null,
                },
              },
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
  async findOneById(id: string): Promise<any> {
    const category = (await this.categoryModel.findOne({
      _id: id,
      delete_at: null,
    })) as any;
    if (category) {
      return category;
    }
    throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
  }

  /**
   *method to get a category by slug
   * @param {string} slug
   * @returns {Promise<Category>}
   */
  async findOneBySlug(slug: string): Promise<any> {
    const category = (await this.categoryModel.findOne({
      slug: slug,
      delete_at: null,
    })) as any;
    if (category) {
      return category;
    }
    throw new HttpException(
      'The specified category was not found',
      HttpStatus.CONFLICT,
    );
  }

  /**
   * method to update a category
   * @param {string} id
   * @param {UpdateCategoryDto} updateCategoryDto
   * @throws {HttpException} category not found
   * @returns {Promise<Category>}
   */
  async update(id: string, updateCategory: UpdateCategoryDto): Promise<any> {
    const category = await this.categoryModel.findOne({
      _id: id,
      delete_at: null,
    });

    if (category) {
      Object.assign(category, updateCategory);
      return category.save() as any;
    }
    throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
  }

  /**
   * method to delete a category
   * @param {string} id
   * @throws {HttpException} category not found
   * @returns {Promise<Category>}
   */
  async delete(id: string): Promise<any> {
    const deleted_category = await this.categoryModel.findOneAndUpdate(
      {
        _id: id,
        delete_at: null,
      },
      { $set: { delete_at: Date.now() } },
    );

    if (deleted_category) {
      return deleted_category as any;
    }

    throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
  }

  async addParameter(id: string, id_parameter: string) {
    await this.categoryModel.findByIdAndUpdate(id, {
      $push: { parameters: id_parameter },
    });
  }
}
