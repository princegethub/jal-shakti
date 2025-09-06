import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const siteValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  location: Joi.object({
    type: Joi.string().valid('Point').default('Point'),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }),
  administrativeArea: Joi.string().allow(''),
  createdBy: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
});
