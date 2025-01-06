// test/integration/routes/wasteTypeRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const wasteTypeRoutes = require('../../../routes/wasteTypeRoutes');
const WasteType = require('../../../models/WasteType');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const { expect } = chai;

describe('WasteType Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Simula el usuario autenticado
        app.use('/api/waste-types', (req, res, next) => {
            req.user = { id: 999 };  // Simula el ID de usuario
            next();
        }, wasteTypeRoutes);

        // Simulamos las funciones de Sequelize y auditoría
        sinon.stub(AuditLog, 'create').resolves(); // Simula la función de auditoría
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para crear un WasteType
    describe('POST /api/waste-types', () => {
        it('Debería crear un WasteType correctamente', async () => {
            const wasteTypeMock = { id: 1, type_name: 'Plastic', water_savings_index: 10, co2_emission_index: 5 };

            // Simulamos la creación de un WasteType
            sinon.stub(WasteType, 'create').resolves(wasteTypeMock);

            const res = await request(app)
                .post('/api/waste-types')
                .send({
                    type_name: 'Plastic',
                    water_savings_index: 10,
                    co2_emission_index: 5
                });

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(wasteTypeMock);
        });

        it('Debería devolver un error 400 si faltan campos requeridos', async () => {
            const res = await request(app)
                .post('/api/waste-types')
                .send({
                    type_name: 'Plastic',
                    co2_emission_index: 5
                });  // Falta el campo `water_savings_index`

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Invalid input data');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(WasteType, 'create').throws(new Error('Database error'));

            const res = await request(app)
                .post('/api/waste-types')
                .send({
                    type_name: 'Plastic',
                    water_savings_index: 10,
                    co2_emission_index: 5
                });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener un WasteType por su ID
    describe('GET /api/waste-types/:id', () => {
        it('Debería devolver un WasteType por su ID', async () => {
            const wasteTypeMock = { id: 1, type_name: 'Plastic', water_savings_index: 10, co2_emission_index: 5 };
            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock);

            const res = await request(app).get('/api/waste-types/1');

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(wasteTypeMock);
        });

        it('Debería devolver un error 404 si el WasteType no existe', async () => {
            sinon.stub(WasteType, 'findByPk').resolves(null);

            const res = await request(app).get('/api/waste-types/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Waste Type not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).get('/api/waste-types/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para actualizar un WasteType
    describe('PUT /api/waste-types/:id', () => {
        it('Debería actualizar un WasteType correctamente', async () => {
            const wasteTypeMock = {
                id: 1,
                type_name: 'Plastic',
                water_savings_index: 10,
                co2_emission_index: 5,
                dataValues: { type_name: 'Plastic', water_savings_index: 10, co2_emission_index: 5 },
                update: sinon.stub().resolves(),
                save: sinon.stub().resolves() // Simular el método save
            };

            // Simular `findByPk` para devolver el WasteType existente
            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock);

            wasteTypeMock.update.callsFake(async (newData) => {
                Object.assign(wasteTypeMock, newData); // Actualizamos los datos
            });

            const res = await request(app)
                .put('/api/waste-types/1')
                .send({ type_name: 'Updated Plastic', water_savings_index: 12 });

            expect(res.status).to.equal(200);
            expect(res.body.data.type_name).to.equal('Updated Plastic');
            expect(res.body.data.water_savings_index).to.equal(12);
        });

        it('Debería devolver un error 404 si el WasteType no existe', async () => {
            sinon.stub(WasteType, 'findByPk').resolves(null);

            const res = await request(app)
                .put('/api/waste-types/1')
                .send({ type_name: 'Updated Plastic', water_savings_index: 12 });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Waste Type not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            const res = await request(app)
                .put('/api/waste-types/1')
                .send({ type_name: 'Updated Plastic', water_savings_index: 12 });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para eliminar un WasteType
    describe('DELETE /api/waste-types/:id', () => {
        it('Debería eliminar un WasteType correctamente', async () => {
            const wasteTypeMock = { id: 1, type_name: 'Plastic', destroy: sinon.stub().resolves() };
            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock);

            const res = await request(app).delete('/api/waste-types/1');

            expect(res.status).to.equal(204);
        });

        it('Debería devolver un error 404 si el WasteType no existe', async () => {
            sinon.stub(WasteType, 'findByPk').resolves(null);

            const res = await request(app).delete('/api/waste-types/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Waste Type not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).delete('/api/waste-types/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });
});
