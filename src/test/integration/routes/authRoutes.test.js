// test/integration/routes/authRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../../routes/authRoutes');
const { expect } = chai;

describe('Auth Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Incluir las rutas de autenticación
        app.use('/auth', authRoutes);
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para la ruta de generación de token
    describe('POST /auth/token', () => {
        it('Debería devolver un token JWT cuando las credenciales son correctas', async () => {
            const res = await request(app)
                .post('/auth/token')
                .send({
                    username: process.env.API_USER, // Credenciales correctas
                    password: process.env.API_PASS,
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('token'); // Verifica que el token está presente
            expect(res.body.token).to.be.a('string'); // Verifica que el token es una cadena
        });

        it('Debería devolver un error 401 si las credenciales son incorrectas', async () => {
            const res = await request(app)
                .post('/auth/token')
                .send({
                    username: 'wrong_user', // Credenciales incorrectas
                    password: 'wrong_password',
                });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property('error', 'Invalid credentials'); // Verifica el mensaje de error
        });
    });
});
