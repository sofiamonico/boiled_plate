import { Pagination } from '../utils/pagination/pagination.dto';
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
import { PaginatedResponse } from 'src/types/pagination.types';

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
   * @returns {Promise<PaginatedResponse<Category>>}
   */
  @Get()
  findAll(
    @Query() plainPagination: Pagination,
  ): Promise<PaginatedResponse<Category>> {
    const pagination = plainToInstance(Pagination, plainPagination);
    return this.categoryService.findAll(pagination);
  }

  /**
   * controller to get a category by id
   * @param {string} id
   * @returns {Category}
   */
  @HttpCode(HttpStatus.OK)
  @UsePipes(ParseUUIDPipe)
  @Get('id=:id')
  findOneById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<any> {
    return this.categoryService.findOneById(id);
  }

  /**
   * controller to get a category by slug
   * @param params
   * @returns {Category}
   */
  @Get('slug=:slug')
  findOneBySlug(@Param() params): Promise<any> {
    return this.categoryService.findOneBySlug(params.slug);
  }
}
