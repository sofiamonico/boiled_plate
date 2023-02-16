import { Filter } from './dto/filter.dto';
import { Parameter } from 'src/parameter/schema/parameter.schema';
import { ParameterService } from './parameter.service';
import { Body, Controller, Get, Post, Query, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/exception-filters/http-excepcion.filtro';
import { CreateParameterDto } from './dto/create-parameter.dto';
import { Pagination } from 'src/utils/pagination/pagination.dto';
import { PaginatedResponse } from 'src/types/pagination.types';
import { plainToInstance } from 'class-transformer';

@ApiTags('parameters')
@Controller('parameters')
@UseFilters(HttpExceptionFilter)
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  /**
   * Controller POST /categories to create parameters
   * @param {CreateParameterDto} createParameter
   * @returns {Parameter}
   */
  @Post()
  create(@Body() createParameter: CreateParameterDto): Promise<Parameter> {
    return this.parameterService.create(createParameter);
  }

  /**
   *  controller to get all paginated parameters and filters
   * @param {Pagination} plainPagination
   * @param {Filter} filter
   * @returns {Promise<PaginatedResponse<Parameter>>}
   */
  @Get()
  findAll(
    @Query() plainPagination: Pagination,
    @Query() filter: Filter,
  ): Promise<PaginatedResponse<Parameter>> {
    const pagination = plainToInstance(Pagination, plainPagination);

    return this.parameterService.findAll(pagination, filter);
  }
}
