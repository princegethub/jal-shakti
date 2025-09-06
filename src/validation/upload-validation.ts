import Joi from 'joi';
import { ObjectId } from 'mongodb';

export const uploadValidation = Joi.object({
  uploader: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
  filename: Joi.string().required(),
  s3Key: Joi.string().allow(''),
  contentType: Joi.string().allow(''),
  rowCount: Joi.number(),
  status: Joi.string()
    .valid('uploaded', 'processing', 'validated', 'rejected')
    .default('uploaded'),
  meta: Joi.object(),
});
