import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude, Expose } from 'class-transformer';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CategoryDocument = HydratedDocument<Category>;

@Exclude()
@Schema({
  timestamps: {
    createdAt: 'created_at', // Use `created_at` to store the created date
    updatedAt: 'updated_at', // and `updated_at` to store the last updated date
  },
})
export class Category {
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
  @MinLength(3)
  @MaxLength(50)
  @Prop({ required: true, unique: true })
  name: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(53)
  @Prop({
    //This function is responsible for taking the name of the category,
    //converting it to lower case and adding an underscore for each word.
    default: function () {
      return this.name.toLowerCase().split(' ').join('_');
    },
    unique: true,
  })
  slug: string;

  @Expose()
  @IsString()
  @IsNotEmpty()
  @MinLength(20)
  @MaxLength(70)
  @Prop({ required: true })
  description: string;

  @Expose()
  @Prop()
  created_at: Date;

  @Expose()
  @Prop()
  updated_at: Date;

  @Expose()
  @Prop()
  delete_at: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
