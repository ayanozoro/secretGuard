import mongoose from "mongoose"

const findingSchema = new mongoose.Schema({
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
    fingerprint: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true
    },
    ruleId: {
        type: String,
        required: true
    },
    ruleName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    line: {
        type: Number,
        required: true
    },
    column: {
        type: Number,
        default: 1
    },
    variable: {
        type: String,
        default: null
    },
    maskedSecret: {
        type: String,
        required: true
    },
    snippet: {
        type: String,
        required: true
    },
    confidence: {
        type: Number,
        required: true,
        min: 0,
        max: 1
    },
    severity: {
        type: String,
        enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"],
        required: true,
        index: true
    },
    entropy: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ["OPEN", "RESOLVED", "IGNORED", "REVOKED", "FALSE_POSITIVE"],
        default: "OPEN",
        index: true
    },
    remediation: [String],
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
})

// Compound indices for dashboard and deduplication queries
findingSchema.index({ repositoryId: 1, status: 1 })
findingSchema.index({ repositoryId: 1, fingerprint: 1 })
findingSchema.index({ severity: 1, status: 1 })

findingSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.__v
        return ret
    }
})

export const Finding = mongoose.models.Finding || mongoose.model("Finding", findingSchema);
export default Finding;
