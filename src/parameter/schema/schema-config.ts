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

/**
 * method for generate slug increment
 * @param {ParameterDocument} document
 * @param {Connection} conn
 */
async function updateSlug(document: ParameterDocument, conn: Connection) {
  const newSlug = document.name.toLowerCase().split(' ').join('_');
  const paremeter = conn.db.collection('parameters');
  const parameters = await paremeter
    .find()
    .filter({ slug: { $regex: newSlug } })
    .toArray();

  if (parameters.length != 0) {
    const stringAmount = parameters[parameters.length - 1]['slug'].slice(-1);
    if (Number(stringAmount)) {
      document.slug = `${newSlug}${parseInt(stringAmount) + 1}`;
    } else {
      document.slug = `${newSlug}1`;
    }
  } else {
    document.slug = newSlug;
  }
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
    assingValue(document);
    return updateSlug(document, conn);
  };
};

export const configParameterSchema = function (conn: Connection) {
  const schema = ParameterSchema;
  schema.pre('save', preSave(conn));
  return schema;
};
