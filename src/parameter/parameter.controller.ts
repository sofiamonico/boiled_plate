import { Parameter } from 'src/parameter/schema/parameter.schema';
import { ParameterService } from './parameter.service';
import { Body, Controller, Post, UseFilters } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/exception-filters/http-excepcion.filtro';
import { CreateParameterDto } from './dto/create-parameter.dto';

@ApiTags('parameters')
@Controller('parameters')
@UseFilters(HttpExceptionFilter)
export class ParameterController {
  constructor(private readonly parameterService: ParameterService) {}

  @Post()
  create(@Body() createParameter: CreateParameterDto): Promise<Parameter> {
    return this.parameterService.create(createParameter);
  }
}
