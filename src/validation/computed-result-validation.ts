import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const computedResultValidation = Joi.object({
  sampleId: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
  uploadId: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
  computedAt: Joi.date(),
  pi: Joi.object(),
  hmpi: Joi.number(),
  ncpi: Joi.number(),
  criticalMetals: Joi.array().items(Joi.string()),
  safetyLevel: Joi.string().valid('safe', 'moderate', 'high'),
  computedBy: Joi.string().allow(''),
});
