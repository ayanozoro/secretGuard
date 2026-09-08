import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import * as userRepository from "../repositories/userRepository.js"

const jwt_secret = process.env.JWT_SECRET;
const expire_in = "7d";


