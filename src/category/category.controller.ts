import { Pagination } from './pagination/pagination.dto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseFilters,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { HttpExceptionFilter } from './exception-filters/http-excepcion.filtro';
import { Category } from './schema/category.schema';
import { plainToInstance } from 'class-transformer';

@ApiTags('categories')
@Controller('categories')
@UseFilters(HttpExceptionFilter)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  /**
   * Controller POST /categories to create categories
   * @param {CreateCategoryDto} createCategoyDto with name and description
   * @returns {Category}
   */
  @Post()
  create(@Body() createCategoyDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoyDto);
  }

  /**
   * controller to get all paginated categories
   * @returns {Category[]}
   */
  @Get()
  findAll(@Query() plainPagination: Pagination) {
    const pagination = plainToInstance(Pagination, plainPagination);
    return this.categoryService.findAll(pagination);
  }

  /**
   * controller to get a category by id
   * @param {string} id
   * @throws {HttpException} non-existent category
   * @returns {Category}
   */
  @HttpCode(HttpStatus.OK)
  @UsePipes(ParseUUIDPipe)
  @Get('id=:id')
  findOneById(@Param('id') id: string) {
    try {
      return this.categoryService.findOneById(id);
    } catch (error) {
      console.error(error.message);
    }
  }
  /**
   * controller to get a category by slug
   * @param params
   * @throws {HttpException} non-existent category
   * @returns {Category}
   */
  @Get('slug=:slug')
  findOneBySlug(@Param() params) {
    try {
      return this.categoryService.findOneBySlug(params.slug);
    } catch (error) {
      console.error(error.message);
    }
  }
}
