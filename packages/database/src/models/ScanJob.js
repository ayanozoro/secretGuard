import mongoose from "mongoose"

const scanJobSchema = new mongoose.Schema({
    scanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Scan",
        required: true,
        index: true
    },
    repositoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repository",
        required: true,
        index: true
    },
    jobId: {
        type: String,
        required: true,
        index: true
    },
    status: {
        type: String,
        enum: ["QUEUED", "ACTIVE", "COMPLETED", "FAILED", "CANCELLED"],
        default: "QUEUED",
        index: true
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    stage: {
        type: String,
        default: "QUEUED"
    },
    attempts: {
        type: Number,
        default: 0
    },
    error: {
        type: String
    },
    failedReason: {
        type: String
    }
}, {
    timestamps: true
})

scanJobSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
    }
})

export const ScanJob = mongoose.models.ScanJob || mongoose.model("ScanJob", scanJobSchema);
export default ScanJob;
