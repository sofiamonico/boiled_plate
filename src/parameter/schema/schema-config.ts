import { Parameter } from '../schema/parameter.schema';
import { ParameterSchema, ParameterDocument } from './parameter.schema';
import { Connection } from 'mongoose';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

const validateCategory = async (documentToSave: ParameterDocument) => {
  const validationErrors = await validate(
    plainToInstance(Parameter, documentToSave),
  );
  //Then I check with an If if the validate method brought validation errors.
  // If yes, I capture them with a Throw, and if not, the category is created
  if (validationErrors.length > 0) {
    throw new Error(validationErrors.toString());
  }
};

function updateSlug(document: ParameterDocument) {
  document.slug = document.name.toLowerCase().split(' ').join('_');
}

function assingValue(document: ParameterDocument) {
  document.value = document.default;
}
//I define a document with the new category that enters and is going to be saved,
//and I send it as a parameter of the function validateCategory
const preSave = function (conn: Connection) {
  return async function () {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const document: ParameterDocument = this;
    await validateCategory(document);
    updateSlug(document);
    assingValue(document);
  };
};

export const configParameterSchema = function (conn: Connection) {
  const schema = ParameterSchema;
  schema.pre('save', preSave(conn));
  return schema;
};
