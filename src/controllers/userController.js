// controllers/userController.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { logAudit } = require('../utils/auditLogger');
const captureError = require('../middleware/captureError');  // Importar la función de captura de errores

// Controlador para subir la foto de perfil en formato base64
exports.uploadProfilePhoto = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { profile_photo } = req.body;
        if (!profile_photo) {
            return res.status(400).json({ error: 'No image provided' });
        }

        const oldValues = { profile_photo: user.profile_photo };
        user.profile_photo = profile_photo;
        await user.save();

        // Registrar auditoría para la actualización de la foto de perfil
        await logAudit('UPDATE', 'user', user.id, oldValues, { profile_photo: profile_photo }, req.user.id);

        res.status(200).json({
            success: true,
            message: 'Profile photo uploaded successfully',
            data: user
        });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const username = email.split('@')[0];
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });
        console.log(newUser)
        console.log(newUser.id)
        // Registrar auditoría para la creación del usuario
        await logAudit('CREATE', 'user', newUser.id, null, newUser, newUser.id);

        res.status(201).json({
            success: true,
            data: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Actualizar nombre y fecha de nacimiento de un usuario
exports.updateNameAndBirthdate = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { name, lastname, birthdate } = req.body;
        if (!name || !lastname || !birthdate) {
            return res.status(400).json({ error: 'Name, lastname, and birthdate are required' });
        }

        const oldValues = { name: user.name, lastname: user.lastname, birthdate: user.birthdate };
        await user.update({ name, lastname, birthdate });

        // Registrar auditoría
        await logAudit('UPDATE', 'user', user.id, oldValues, { name, lastname, birthdate }, req.user.id);

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Actualizar la contraseña de un usuario
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'Old password and new password are required' });
        }

        const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: 'Old password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const oldValues = { password: user.password };
        await user.update({ password: hashedPassword });

        // Registrar auditoría para la actualización de la contraseña
        await logAudit('UPDATE', 'user', user.id, oldValues, { password: hashedPassword }, req.user.id);

        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Inicio de sesión del usuario
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // Buscar al usuario por el email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }

        // Comparar la contraseña ingresada con la almacenada en la base de datos
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(404).json({ error: 'Invalid email or password' });
        }

        let token = null;

        // Generar el token JWT solo si estás en producción
        if (process.env.NODE_ENV === 'production') {
            token = jwt.sign(
                { id: user.id, email: user.email }, // Datos en el token
                process.env.JWT_SECRET,             // Clave secreta
                { expiresIn: '1h' }                 // Expira en 1 hora
            );
        }

        // Responder con los datos del usuario, y el token solo si estás en producción
        res.status(200).json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            ...(token && { token }),  // Incluir el token solo si existe (es decir, en producción)
        });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Obtener un usuario por su ID
exports.getUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Actualizar un usuario por su ID
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const oldValues = { ...user.dataValues };
        await user.update(req.body);

        // Registrar auditoría
        await logAudit('UPDATE', 'user', user.id, oldValues, user, req.user.id);

        res.status(200).json({ success: true, data: user });
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Eliminar un usuario por su ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const oldValues = { ...user.dataValues };
        await user.destroy();

        // Registrar auditoría
        await logAudit('DELETE', 'user', user.id, oldValues, null, req.user.id);

        res.status(204).send();
    } catch (error) {
        captureError(error);  // Capturar el error con Sentry
        res.status(500).json({ error: 'Internal server error' });
    }
};
