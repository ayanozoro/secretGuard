import jwt from "jsonwebtoken"
import * as userRepo from "../repositories/userRepository.js"

const jwt_secret = process.env.JWT_SECRET;

export async function protect(req, res, next) {
    try {
        const auth_header = req.headers.authorization;
        if (!auth_header) {
            return res.status(401).json({ message: "Unauthorized" })
        }
        const api_key_header = req.headers["x-api-key"]
        if(auth_header && auth_header.startsWith("Bearer")){
            const token = auth_header.split(" ")[1]
            const decoded_token = jwt.verify(token, jwt_secret)
            req.user = await userRepo.findById(decoded_token.id)
        }else if(api_key_header){
            req.user = await userRepo.findByApiKey(api_key_header)
        }
        if(!req.user){
            return res.status(401).json({ message: "Unauthorized" })
        }
        next()
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized" })
    }
}

export async function roleBasedAuth(roles){
    return async function(req,res,next){
        if(!roles.includes(req.user.role)){
            return res.status(403).json({ message: "Forbidden" })
        }
        next()
    }
}