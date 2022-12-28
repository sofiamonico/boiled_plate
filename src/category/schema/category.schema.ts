import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({
  timestamps: {
    createdAt: 'created_at', // Use `created_at` to store the created date
    updatedAt: 'updated_at', // and `updated_at` to store the last updated date
  },
})
export class Category {
  @Prop({
    type: String,
    default: function genUUID() {
      return uuidv4();
    },
  })
  _id: string;
  @Prop({ required: true, minLength: 3, maxLength: 50, unique: true })
  name: string;
  @Prop({
    minLength: 3,
    maxLength: 53,
    unique: true,
    default: function () {
      return this.name.toLowerCase().split(' ').join('_');
    },
  })
  slug: string;
  @Prop({ required: true, minLength: 20, maxLength: 70 })
  description: string;
  @Prop()
  created_at: Date;
  @Prop()
  updated_at: Date;
  @Prop()
  delete_at: Date;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
