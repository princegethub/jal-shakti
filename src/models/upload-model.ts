import mongoose, { Document, Schema, Types } from 'mongoose';
import { toJSON, paginate } from '@/plugins/index';
import { UPLOAD_STATUS } from '@/constants/enum';

// ---------- Uploads ----------
interface IUpload extends Document {
  uploader?: Types.ObjectId;
  filename?: string;
  s3Key?: string;
  contentType?: string;
  rowCount?: number;
  status: UPLOAD_STATUS;
  isDeleted: boolean;
  meta?: Record<string, unknown>;
}

const uploadSchema = new Schema<IUpload>(
  {
    uploader: { type: Schema.Types.ObjectId, ref: 'User' },
    filename: String,
    s3Key: String,
    contentType: String,
    rowCount: Number,
    status: {
      type: String,
      enum: Object.values(UPLOAD_STATUS),
      default: UPLOAD_STATUS.UPLOADED,
    },
    isDeleted: { type: Boolean, default: false },
    meta: Object,
  },
  { timestamps: true },
);

uploadSchema.plugin(toJSON);
uploadSchema.plugin(paginate);

export const Upload = mongoose.model<IUpload>('Upload', uploadSchema);
