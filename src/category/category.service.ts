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

  /**
   * method to update a category
   * @param {string} id
   * @param {UpdateCategoryDto} updateCategoryDto
   * @throws {HttpException} category not found
   * @returns {Promise<Category>}
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    const category = await this.categoryModel.findById(id);
    if (category === null || category.delete_at != null) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }
    Object.assign(category, updateCategoryDto);
    return category.save() as any;
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

    if (deleted_category === null) {
      throw new HttpException('Category not found', HttpStatus.NOT_FOUND);
    }

    return deleted_category as any;
  }
}
