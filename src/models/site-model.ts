import mongoose, { Document, Schema, Types } from 'mongoose';
import { toJSON, paginate } from '@/plugins/index';
import { AREA_TYPE, LOCATION_TYPE } from '@/constants/enum';

// ---------- Sites ----------
interface ISite extends Document {
  name?: string;
  description?: string;
  location: {
    type: LOCATION_TYPE.POINT;
    coordinates: [number, number]; // [longitude, latitude]
  };
  administrativeArea?: string;
  areaType: AREA_TYPE;
  isDeleted: boolean;
  createdBy?: Types.ObjectId;
}

const siteSchema = new Schema<ISite>(
  {
    name: String,
    description: String,
    location: {
      type: {
        type: String,
        enum: Object.values(LOCATION_TYPE),
        required: true,
        default: LOCATION_TYPE.POINT,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    areaType: {
      type: String,
      enum: Object.values(AREA_TYPE),
      required: true,
      default: AREA_TYPE.URBAN,
    },
    administrativeArea: String,
    isDeleted: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

siteSchema.index({ location: '2dsphere' });
siteSchema.plugin(toJSON);
siteSchema.plugin(paginate);

export const Site = mongoose.model<ISite>('Site', siteSchema);
