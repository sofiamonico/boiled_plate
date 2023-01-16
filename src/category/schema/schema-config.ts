import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Connection } from 'mongoose';
import { Category, CategoryDocument, CategorySchema } from './category.schema';

//It receives a Category Document with the category that is going to be created,
// first it is flattened with PlainToIntance and then it is sent to Validate to do the
//corresponding validations
const validateCategory = async (documentToSave: CategoryDocument) => {
  const validationErrors = await validate(
    plainToInstance(Category, documentToSave),
  );
  //Then I check with an If if the validate method brought validation errors.
  // If yes, I capture them with a Throw, and if not, the category is created
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.toString());
  }
};
//I define a document with the new category that enters and is going to be saved,
//and I send it as a parameter of the function validateCategory
const preSave = function (conn: Connection) {
  return async function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const document: CategoryDocument = this;
    await validateCategory(document);
  };
};
//I create a new schema and configure a pre save, that is, before it is saved,
// it calls the function preSave()
export const configCategorySchema = function (conn: Connection) {
  const schema = CategorySchema;
  schema.pre('save', preSave(conn));
  return schema;
};
