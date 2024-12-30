// middleware/validateUser.js
const { body, validationResult } = require('express-validator');

// Validación para el registro de usuarios
exports.validateRegister = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
];

// Validación para el login de usuarios
exports.validateLogin = [
    body('email').isEmail().withMessage('Invalid email format'),
    body('password').notEmpty().withMessage('Password is required'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
];

// Validación para actualizar nombre, apellido y fecha de nacimiento
exports.validateUpdateNameAndBirthdate = [
    body('name').optional().isString().withMessage('Name must be a string'),
    body('lastname').optional().isString().withMessage('Lastname must be a string'),
    body('birthdate').optional().isISO8601().withMessage('Birthdate must be a valid date'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
];

// Validación para actualizar contraseña
exports.validateUpdatePassword = [
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }
        next();
    },
];
