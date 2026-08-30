import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const TAG_LENGTH = 16;
const DEFAULT_SECRET = process.env.SECRETGUARD_ENCRYPTION_KEY || "secretguard-master-encryption-key-32b!";

function getDerivedKey(secret = DEFAULT_SECRET) {
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts sensitive credentials (like integration tokens) using AES-256-GCM.
 * 
 * @param {string} text - Plaintext to encrypt
 * @param {string} secretKey - Encryption key
 * @returns {string} iv:tag:ciphertext in hex
 */
export function encrypt(text, secretKey = DEFAULT_SECRET) {
  if (!text) return "";
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getDerivedKey(secretKey);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypts encrypted text using AES-256-GCM.
 * 
 * @param {string} encryptedData - iv:tag:ciphertext
 * @param {string} secretKey - Encryption key
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedData, secretKey = DEFAULT_SECRET) {
  if (!encryptedData || !encryptedData.includes(":")) return "";
  const [ivHex, tagHex, encryptedText] = encryptedData.split(":");
  const key = getDerivedKey(secretKey);
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
