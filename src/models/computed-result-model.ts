import mongoose, { Document, Schema, Types } from 'mongoose';
import { toJSON, paginate } from '@/plugins/index';
import { SAFETY_LEVEL } from '@/constants/enum';

// ---------- Computed Results ----------
interface IComputedResult extends Document {
  sampleId?: Types.ObjectId;
  uploadId?: Types.ObjectId;
  computedAt?: Date;
  pi: Record<string, number>;
  hmpi: number;
  ncpi: number;
  criticalMetals: string[];
  safetyLevel: SAFETY_LEVEL;
  computedBy?: string;
}

const computedResultSchema = new Schema<IComputedResult>(
  {
    sampleId: { type: Schema.Types.ObjectId, ref: 'Sample' },
    uploadId: { type: Schema.Types.ObjectId, ref: 'Upload' },
    computedAt: { type: Date, default: Date.now },
    pi: Schema.Types.Mixed,
    hmpi: Number,
    ncpi: Number,
    criticalMetals: [String],
    safetyLevel: { type: String, enum: Object.values(SAFETY_LEVEL) },
    computedBy: String,
  },
  { timestamps: true },
);

computedResultSchema.index({ hmpi: 1 });
computedResultSchema.plugin(toJSON);
computedResultSchema.plugin(paginate);

export const ComputedResult = mongoose.model<IComputedResult>(
  'ComputedResult',
  computedResultSchema,
);
