import { ParameterDocument } from './schema/parameter.schema';
import { Parameter } from 'src/parameter/schema/parameter.schema';
import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class ParameterService {
  constructor(
    @InjectModel(Parameter.name)
    private categoryModel: Model<ParameterDocument>,
  ) {}
}
