import mongoose from "mongoose";

const scanSchema = new mongoose.Schema({
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Repository",
    required: true,
    index: true
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  trigger: {
    type: String,
    enum: ["CLI", "MANUAL", "SCHEDULED", "WEBHOOK_PUSH", "WEBHOOK_PR"],
    default: "MANUAL"
  },
  status: {
    type: String,
    enum: ["PENDING", "RUNNING", "COMPLETED", "FAILED", "CANCELLED"],
    default: "PENDING",
    index: true
  },
  branch: {
    type: String,
    default: "main",
    trim: true
  },
  commitHash: {
    type: String,
    trim: true
  },
  totalFilesScanned: {
    type: Number,
    default: 0
  },
  totalCommitsScanned: {
    type: Number,
    default: 0
  },
  totalFindings: {
    type: Number,
    default: 0
  },
  severityCounts: {
    critical: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    low: { type: Number, default: 0 }
  },
  durationMs: {
    type: Number,
    default: 0
  },
  errorMessage: {
    type: String
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

scanSchema.index({ repositoryId: 1, createdAt: -1 });

scanSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Scan = mongoose.models.Scan || mongoose.model("Scan", scanSchema);
export default Scan;
