import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Connection } from 'mongoose';
import { Category, CategoryDocument, CategorySchema } from './category.schema';

const validateCategory = async (documentToSave: CategoryDocument) => {
  const validationErrors = await validate(
    plainToInstance(Category, documentToSave),
  );

  if (validationErrors.length > 0) {
    throw new Error(validationErrors.toString());
  }
};

const preSave = function (conn: Connection) {
  return async function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const document: CategoryDocument = this;
    await validateCategory(document);
  };
};

export const configCategorySchema = function (conn: Connection) {
  const schema = CategorySchema;
  schema.pre('save', preSave(conn));
  return schema;
};
