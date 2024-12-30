// test/integration/routes/userRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const userRoutes = require('../../../routes/userRoutes');
const User = require('../../../models/User');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const bcrypt = require('bcrypt');
const { expect } = chai;

describe('User Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Simula el usuario autenticado
        app.use('/api/users', (req, res, next) => {
            req.user = { id: 999 };  // Simula el ID de usuario
            next();
        }, userRoutes);

        // Simulamos las funciones de Sequelize y auditoría
        sinon.stub(AuditLog, 'create').resolves(); // Simula la función de auditoría
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para validar el registro de usuario
    describe('POST /api/users/register', () => {
        it('Debería devolver un error 400 si el email es inválido', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Invalid email format');
        });

        it('Debería devolver un error 400 si la contraseña es demasiado corta', async () => {
            const res = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'test@example.com',
                    password: '123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Password must be at least 6 characters long');
        });

        it('Debería registrar un nuevo usuario correctamente', async () => {
            const userMock = { id: 1, username: 'testuser', email: 'test@example.com' };

            // Simulamos la creación de un usuario
            sinon.stub(User, 'create').resolves(userMock);
            sinon.stub(User, 'findOne').resolves(null); // Simula que el usuario no existe

            const res = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(userMock);
        });

        it('Debería devolver un error 400 si el email ya está en uso', async () => {
            const userMock = { id: 1, email: 'test@example.com' };

            // Simula que ya existe un usuario con ese correo
            sinon.stub(User, 'findOne').resolves(userMock);

            const res = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Email already in use');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(User, 'findOne').throws(new Error('Database error'));

            const res = await request(app)
                .post('/api/users/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal server error');
        });
    });

    // Prueba para validar el login de usuario
    describe('POST /api/users/login', () => {
        it('Debería devolver un error 400 si el formato del email es inválido', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Invalid email format');
        });

        it('Debería devolver un error 400 si no se proporciona la contraseña', async () => {
            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: ''
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Password is required');
        });

        it('Debería iniciar sesión correctamente', async () => {
            const userMock = { id: 1, username: 'testuser', email: 'test@example.com', password: 'hashedPassword' };

            // Simulamos la búsqueda del usuario y la comparación de contraseñas
            sinon.stub(User, 'findOne').resolves(userMock);
            sinon.stub(bcrypt, 'compare').resolves(true); // Simulamos que la contraseña es válida

            const res = await request(app)
                .post('/api/users/login')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.username).to.equal('testuser');
        });
    });

    // Prueba para validar la actualización de nombre y fecha de nacimiento
    describe('PUT /api/users/:id/update-name-birthdate', () => {
        it('Debería devolver un error 400 si el nombre no es una cadena', async () => {
            const res = await request(app)
                .put('/api/users/1/update-name-birthdate')
                .send({
                    name: 12345,
                    lastname: 'UpdatedLastname',
                    birthdate: '1995-05-05'
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Name must be a string');
        });

        it('Debería devolver un error 400 si la fecha de nacimiento no es válida', async () => {
            const res = await request(app)
                .put('/api/users/1/update-name-birthdate')
                .send({
                    name: 'UpdatedName',
                    lastname: 'UpdatedLastname',
                    birthdate: 'invalid-date'
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Birthdate must be a valid date');
        });

        it('Debería actualizar el nombre y la fecha de nacimiento correctamente', async () => {
            const userMock = {
                id: 1,
                name: 'Test',
                lastname: 'User',
                birthdate: '1990-01-01',
                update: sinon.stub().resolves()
            };

            // Simular `findByPk` para devolver el usuario existente
            sinon.stub(User, 'findByPk').resolves(userMock);

            userMock.update.callsFake(async (newData) => {
                Object.assign(userMock, newData); // Actualizamos los datos
            });

            const res = await request(app)
                .put('/api/users/1/update-name-birthdate')
                .send({
                    name: 'UpdatedName',
                    lastname: 'UpdatedLastname',
                    birthdate: '1995-05-05'
                });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.name).to.equal('UpdatedName');
        });
    });

    // Prueba para validar la actualización de la contraseña
    describe('PUT /api/users/:id/update-password', () => {
        it('Debería devolver un error 400 si la nueva contraseña es demasiado corta', async () => {
            const res = await request(app)
                .put('/api/users/1/update-password')
                .send({
                    newPassword: '123'
                });

            expect(res.status).to.equal(400);
            expect(res.body.errors[0].msg).to.equal('Password must be at least 6 characters long');
        });

        it('Debería actualizar la contraseña correctamente', async () => {
            const userMock = {
                id: 1,
                password: 'hashedPassword',
                update: sinon.stub().resolves()
            };
        
            // Simular `findByPk` para devolver el usuario existente
            sinon.stub(User, 'findByPk').resolves(userMock);
        
            // Simula el hash de la nueva contraseña
            sinon.stub(bcrypt, 'compare').resolves(true); // Simula que la contraseña anterior es válida
            sinon.stub(bcrypt, 'hash').resolves('newHashedPassword');
        
            userMock.update.callsFake(async (newData) => {
                Object.assign(userMock, newData); // Actualizamos los datos
            });
        
            const res = await request(app)
                .put('/api/users/1/update-password')
                .send({
                    oldPassword: 'oldPassword123', // Agregar contraseña anterior si se requiere
                    newPassword: 'newPassword123'
                });
        
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
        });        
    });

    // Prueba para eliminar un usuario
    describe('DELETE /api/users/:id', () => {
        it('Debería eliminar un usuario correctamente', async () => {
            const userMock = { id: 1, username: 'testuser', destroy: sinon.stub().resolves() };
            sinon.stub(User, 'findByPk').resolves(userMock);

            const res = await request(app).delete('/api/users/1');

            expect(res.status).to.equal(204);
        });

        it('Debería devolver un error 404 si el usuario no existe', async () => {
            sinon.stub(User, 'findByPk').resolves(null);

            const res = await request(app).delete('/api/users/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('User not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).delete('/api/users/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal server error');
        });
    });
});
