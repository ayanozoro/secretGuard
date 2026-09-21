/**
 * Higher-order middleware to run a validator function against req.body, req.query, or req.params.
 * @param {Function} validatorFn - Function taking (req) and returning array of error objects or empty array.
 */
export function validate(validatorFn) {
    return (req, res, next) => {
        try {
            const errors = validatorFn(req);
            if (errors && errors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Validation failed",
                    errors
                });
            }
            next();
        } catch (err) {
            next(err);
        }
    };
}

// Reusable Field Validators (Zero Dependencies)
export const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);
export const isValidEmail = (email) => 
    typeof email === "string" && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());

// Route-Specific Validators
export function validateRegister(req) {
    const { name, email, password, role } = req.body || {};
    const errors = [];

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.push({ field: "name", message: "Name is required" });
    }

    if (!email || !isValidEmail(email)) {
        errors.push({ field: "email", message: "A valid email is required" });
    }

    if (!password || typeof password !== "string" || password.length < 8) {
        errors.push({ field: "password", message: "Password must be at least 8 characters long" });
    }

    const allowedRoles = ["ADMIN", "SECURITY_ENGINEER", "DEVELOPER"];
    if (role && !allowedRoles.includes(role)) {
        errors.push({ field: "role", message: `Role must be one of: ${allowedRoles.join(", ")}` });
    }

    return errors;
}

export function validateLogin(req) {
    const { email, password } = req.body || {};
    const errors = [];

    if (!email || !isValidEmail(email)) {
        errors.push({ field: "email", message: "A valid email is required" });
    }
    if (!password) {
        errors.push({ field: "password", message: "Password is required" });
    }

    return errors;
}

export function validateObjectIdParam(paramName = "id") {
    return (req, res, next) => {
        const id = req.params?.[paramName];
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: `Invalid ID format for parameter: ${paramName}`
            });
        }
        next();
    };
}

export default validate;

