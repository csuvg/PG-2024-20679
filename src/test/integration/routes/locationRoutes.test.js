// test/integration/routes/locationRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const locationRoutes = require('../../../routes/locationRoutes');
const Location = require('../../../models/Location');
const User = require('../../../models/User');
const Area = require('../../../models/Area');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const { expect } = chai;

describe('Location Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Simula el usuario autenticado
        app.use('/api/locations', (req, res, next) => {
            req.user = { id: 999 };  // Simula el ID de usuario
            next();
        }, locationRoutes);

        // Simulamos las funciones de Sequelize y auditoría
        sinon.stub(AuditLog, 'create').resolves(); // Simula la función de auditoría
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para crear una nueva ubicación
    describe('POST /api/locations', () => {
        it('Debería crear una ubicación correctamente', async () => {
            const locationMock = { id: 1, user_id: 999, name: 'Ubicación X', area_id: 1, has_waste_collection: 'Yes' };

            // Simulamos la creación de una ubicación
            sinon.stub(Location, 'create').resolves(locationMock);

            const res = await request(app)
                .post('/api/locations')
                .send({
                    user_id: 999,
                    name: 'Ubicación X',
                    area_id: 1,
                    has_waste_collection: 'Yes'
                });

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(locationMock);
        });

        it('Debería devolver un error 400 si faltan campos requeridos', async () => {
            const res = await request(app)
                .post('/api/locations')
                .send({
                    user_id: 999,  // Falta el campo `name` y otros
                });

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Invalid input data');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Location, 'create').throws(new Error('Database error'));

            const res = await request(app)
                .post('/api/locations')
                .send({
                    user_id: 999,
                    name: 'Ubicación X',
                    area_id: 1,
                    has_waste_collection: 'Yes'
                });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener una ubicación por su ID
    describe('GET /api/locations/:id', () => {
        it('Debería devolver una ubicación por su ID', async () => {
            const locationMock = { id: 1, user_id: 999, name: 'Ubicación X', area_id: 1, has_waste_collection: 'Yes' };
            sinon.stub(Location, 'findByPk').resolves(locationMock);

            const res = await request(app).get('/api/locations/1');

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(locationMock);
        });

        it('Debería devolver un error 404 si la ubicación no existe', async () => {
            sinon.stub(Location, 'findByPk').resolves(null);  // Simula que no existe

            const res = await request(app).get('/api/locations/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Location not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Location, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).get('/api/locations/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener todas las ubicaciones
    describe('GET /api/locations', () => {
        it('Debería devolver todas las ubicaciones', async () => {
            const locationsMock = [
                { id: 1, user_id: 999, name: 'Ubicación X', area_id: 1, has_waste_collection: 'Yes' },
                { id: 2, user_id: 999, name: 'Ubicación Y', area_id: 2, has_waste_collection: 'No' }
            ];
            sinon.stub(Location, 'findAll').resolves(locationsMock);

            const res = await request(app).get('/api/locations');

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(locationsMock);
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Location, 'findAll').throws(new Error('Database error'));

            const res = await request(app).get('/api/locations');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para actualizar una ubicación por su ID
    describe('PUT /api/locations/:id', () => {
        it('Debería actualizar una ubicación correctamente', async () => {
            const locationMock = {
                id: 1,
                user_id: 999,
                name: 'Ubicación X',
                area_id: 1,
                has_waste_collection: 'Yes',
                dataValues: { name: 'Ubicación X', area_id: 1, has_waste_collection: 'Yes' },
                update: sinon.stub().resolves() // Simular el método `update` en el mock
            };

            // Simular `findByPk` para devolver la ubicación existente
            sinon.stub(Location, 'findByPk').resolves(locationMock);

            // Simular que `update` modifica el objeto
            locationMock.update.callsFake(async (newData) => {
                Object.assign(locationMock, newData); // Actualizamos el objeto con los nuevos datos
                Object.assign(locationMock.dataValues, newData); // Actualizamos también `dataValues`
            });

            const res = await request(app)
                .put('/api/locations/1')
                .send({ name: 'Ubicación Actualizada', area_id: 2, has_waste_collection: 'No' });

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.name).to.equal('Ubicación Actualizada');
        });

        it('Debería devolver un error 404 si la ubicación no existe', async () => {
            sinon.stub(Location, 'findByPk').resolves(null);

            const res = await request(app).put('/api/locations/1').send({ name: 'Ubicación Actualizada', area_id: 2, has_waste_collection: 'No' });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Location not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Location, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).put('/api/locations/1').send({ name: 'Ubicación Actualizada', area_id: 2, has_waste_collection: 'No' });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para eliminar una ubicación por su ID
    describe('DELETE /api/locations/:id', () => {
        it('Debería eliminar una ubicación correctamente', async () => {
            const locationMock = { id: 1, name: 'Ubicación X', destroy: sinon.stub().resolves() };
            sinon.stub(Location, 'findByPk').resolves(locationMock);

            const res = await request(app).delete('/api/locations/1');

            expect(res.status).to.equal(204);
        });

        it('Debería devolver un error 404 si la ubicación no existe', async () => {
            sinon.stub(Location, 'findByPk').resolves(null);

            const res = await request(app).delete('/api/locations/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Location not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Location, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).delete('/api/locations/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });
});
