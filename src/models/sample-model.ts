import mongoose, { Document, Schema, Types } from 'mongoose';
import { toJSON, paginate } from '@/plugins/index';
import { allowedMetals } from '@/constants/allowed-metals';
import { LAB_NAME } from '@/constants/enum';
import { metalsErrors } from '@/utils/api-error';

// ---------- Samples ----------

interface ISample extends Document {
  uploadId: Types.ObjectId;
  siteId: Types.ObjectId;
  sampleTime: Date;
  labName: LAB_NAME;
  concentrations: Record<string, number>;
}

const sampleSchema = new Schema<ISample>(
  {
    uploadId: { type: Schema.Types.ObjectId, ref: 'Upload', required: true },
    siteId: { type: Schema.Types.ObjectId, ref: 'Site', required: true },
    sampleTime: {
      type: Date,
      default: Date.now,
    },
    labName: {
      type: String,
      enum: Object.values(LAB_NAME),
      default: LAB_NAME.DELHI_JAL_BOARD_LAB,
      required: true,
    },
    concentrations: {
      type: Schema.Types.Mixed,
      required: true,
      validate: {
        validator: (obj: Record<string, number>) => {
          // 1. All metals must be allowed
          const metals = Object.keys(obj);
          if (!metals.every((m) => allowedMetals.includes(m)))
            throw metalsErrors.unsupportedMetal();
          // 2. All values must be non-negative numbers and reasonable
          if (
            !metals.every(
              (m) => typeof obj[m] === 'number' && obj[m] >= 0 && obj[m] < 1000,
            )
          ) {
            throw metalsErrors.nonNegativeValue();
          }
        },
        message: 'Invalid concentration data',
      },
    },
  },
  { timestamps: true },
);

sampleSchema.index({ siteId: 1 });
sampleSchema.index({ sampleTime: 1 });
sampleSchema.plugin(toJSON);
sampleSchema.plugin(paginate);

export const Sample = mongoose.model<ISample>('Sample', sampleSchema);
