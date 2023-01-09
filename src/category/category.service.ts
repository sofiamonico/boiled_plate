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
  async create(createCategoyDto: CreateCategoryDto) {
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
  findAll() {
    try {
      return this.categoryModel.find({ delete_at: null });
    } catch (err) {
      return null;
    }
  }
}
