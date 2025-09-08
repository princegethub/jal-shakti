import { LAB_NAME } from '@/constants/enum';
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
  labName: Joi.string().valid(...Object.values(LAB_NAME)),
  sampleTime: Joi.date(),
  concentrations: Joi.object(),
});
