import { ParameterService } from './parameter.service';
import { ParameterController } from './parameter.controller';
import { configParameterSchema } from './schema/schema-config';
import { Parameter } from 'src/parameter/schema/parameter.schema';
import { Module } from '@nestjs/common';
import { getConnectionToken, MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forFeatureAsync([
      {
        name: Parameter.name,
        imports: [Connection],
        inject: [getConnectionToken()],
        useFactory: configParameterSchema,
      },
    ]),
  ],
  controllers: [ParameterController],
  providers: [ParameterService],
})
export class CategoryModule {}
