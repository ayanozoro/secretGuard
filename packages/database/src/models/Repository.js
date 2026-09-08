import mongoose from "mongoose";

const repositorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: {
    type: String,
    trim: true
  },
  repoUrl: {
    type: String,
    trim: true
  },
  url: {
    type: String,
    trim: true
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  defaultBranch: {
    type: String,
    default: "main"
  },
  lastScanAt: {
    type: Date
  },
  totalScans: {
    type: Number,
    default: 0
  },
  openFindingsCount: {
    type: Number,
    default: 0
  },
  criticalFindingsCount: {
    type: Number,
    default: 0
  },
  highFindingsCount: {
    type: Number,
    default: 0
  },
  mediumFindingsCount: {
    type: Number,
    default: 0
  },
  lowFindingsCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: "active"
  }
}, {
  timestamps: true
});

repositorySchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});

export const Repository = mongoose.models.Repository || mongoose.model("Repository", repositorySchema);
export default Repository;