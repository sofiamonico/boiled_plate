import { Body, Controller, Get, Post, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { HttpExceptionFilter } from './exception-filters/http-excepcion.filtro';

@ApiTags('categories')
@Controller('categories')
@UseFilters(HttpExceptionFilter)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}
  @Post()
  create(@Body() createCategoyDto: CreateCategoryDto) {
    return this.categoryService.create(createCategoyDto);
  }
  @Get()
  findAll() {
    try {
      return this.categoryService.findAll();
    } catch (err) {
      console.error(err.message);
    }
  }
}
