import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import mongoose, { HydratedDocument } from 'mongoose';
import { Category } from '../../category/schema/category.schema';
import { v4 as uuidv4 } from 'uuid';

export type ParameterDocument = HydratedDocument<Parameter>;

@Exclude()
@Schema({
  timestamps: {
    createdAt: 'created_at', // Use `created_at` to store the created date
    updatedAt: 'updated_at', // and `updated_at` to store the last updated date
  },
})
export class Parameter {
  @Prop({
    type: String,
    //This function generates a unique ID based on uuidv4
    default: function genUUID() {
      return uuidv4();
    },
  })
  _id: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @Prop()
  default: string;

  @Expose()
  @Prop()
  value: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(50)
  @Prop()
  name: string;

  @Expose()
  @Prop()
  slug: string;

  @Expose()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(253)
  @Prop()
  description: string;

  @Prop({ type: [{ type: mongoose.Schema.Types.UUID, ref: 'Category' }] })
  category: Category;

  @Expose()
  @Prop()
  created_at: Date;

  @Expose()
  @Prop()
  updated_at: Date;

  @Expose()
  @IsDate()
  @IsOptional()
  @Prop()
  delete_at: Date;
}

export const ParameterSchema = SchemaFactory.createForClass(Parameter);
