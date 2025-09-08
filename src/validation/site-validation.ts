import { AREA_TYPE, LOCATION_TYPE } from '@/constants/enum';
import Joi from 'joi';
import { ObjectId } from 'mongodb';
export const siteValidation = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  location: Joi.object({
    type: Joi.string()
      .valid(...Object.values(LOCATION_TYPE))
      .default(LOCATION_TYPE.POINT),
    coordinates: Joi.array().items(Joi.number()).length(2),
  }),
  administrativeArea: Joi.string().allow(''),
  areaType: Joi.string()
    .valid(...Object.values(AREA_TYPE))
    .default(AREA_TYPE.URBAN),
  createdBy: Joi.string().custom((value, helpers) => {
    if (!ObjectId.isValid(value)) return helpers.error('any.invalid');
    return value;
  }),
});
