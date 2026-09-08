import { User } from "@secretLeak/database"


async function findByEmail(email) {
    return await User.findOne({ email: email.toLowerCase() })
}

async function findById(id) {
    return await User.findById(id)
}

async function findByApiKey(apiKey) {
    return await User.findOne({ apiKey: apiKey, isActive: true })
}

async function create(userData) {
    return await User.create(userData)
}

async function update(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true })
}

async function deleteById(userId) {
    return await User.findByIdAndDelete(userId)
}

export default {
    findByEmail,
    findById,
    findByApiKey,
    create,
    update,
    deleteById
}