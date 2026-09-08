import mongoose from "mongoose"

const integrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    provider: {
        type: String,
        enum: ["GITHUB", "GITLAB", "BITBUCKET"],
        default: "GITHUB"
    },
    providerUserId: {
        type: String,
        trim: true
    },
    providerUsername: {
        type: String,
        trim: true
    },
    encryptedAccessToken: {
        type: String,
        required: true
    },
    scopes: [String],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
})

// Prevent duplicate provider integrations per user
integrationSchema.index({ userId: 1, provider: 1 }, { unique: true })

integrationSchema.set("toJSON", {
    transform: (doc, ret) => {
        ret.id = ret._id
        delete ret._id
        delete ret.encryptedAccessToken // Never expose encrypted tokens in JSON outputs
        delete ret.__v
        return ret
    }
})

export const Integration = mongoose.models.Integration || mongoose.model("Integration", integrationSchema);
export default Integration;
