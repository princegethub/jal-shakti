import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const sampleValidation = Joi.object({
  uploadId: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
  siteId: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
  sampleTime: Joi.date(),
  labId: Joi.string().allow(''),
  concentrations: Joi.object(),
});
