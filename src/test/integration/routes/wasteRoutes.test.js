// test/integration/routes/wasteRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const wasteRoutes = require('../../../routes/wasteRoutes');
const Waste = require('../../../models/Waste');
const WasteType = require('../../../models/WasteType');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const { expect } = chai;

describe('Waste Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Simula el usuario autenticado
        app.use('/api/wastes', (req, res, next) => {
            req.user = { id: 999 };  // Simula el ID de usuario
            next();
        }, wasteRoutes);

        // Simulamos las funciones de Sequelize y auditoría
        sinon.stub(AuditLog, 'create').resolves(); // Simula la función de auditoría
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para crear un Waste
    describe('POST /api/wastes', () => {
        it('Debería crear un Waste correctamente', async () => {
            const wasteMock = { id: 1, waste_type_id: 1, is_recyclable: true, average_weight: 10 };

            // Simulamos la creación de un Waste
            sinon.stub(Waste, 'create').resolves(wasteMock);
            sinon.stub(WasteType, 'findByPk').resolves({ id: 1 });

            const res = await request(app)
                .post('/api/wastes')
                .send({
                    waste_type_id: 1,
                    is_recyclable: true,
                    average_weight: 10
                });

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(wasteMock);
        });

        it('Debería devolver un error 404 si el WasteType no existe', async () => {
            sinon.stub(WasteType, 'findByPk').resolves(null);

            const res = await request(app)
                .post('/api/wastes')
                .send({
                    waste_type_id: 1,
                    is_recyclable: true,
                    average_weight: 10
                });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('WasteType not found');
        });

        it('Debería devolver un error 400 si faltan campos requeridos', async () => {
            const res = await request(app)
                .post('/api/wastes')
                .send({
                    is_recyclable: true
                });  // Falta `waste_type_id`

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Invalid input data');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(WasteType, 'findByPk').throws(new Error('Database error'));

            const res = await request(app)
                .post('/api/wastes')
                .send({
                    waste_type_id: 1,
                    is_recyclable: true,
                    average_weight: 10
                });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener un Waste por su ID
    describe('GET /api/wastes/:id', () => {
        it('Debería devolver un Waste por su ID', async () => {
            const wasteMock = { id: 1, waste_type_id: 1, is_recyclable: true, WasteType: { id: 1, type_name: 'Plastic' } };
            sinon.stub(Waste, 'findByPk').resolves(wasteMock);

            const res = await request(app).get('/api/wastes/1');

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(wasteMock);
        });

        it('Debería devolver un error 404 si el Waste no existe', async () => {
            sinon.stub(Waste, 'findByPk').resolves(null);

            const res = await request(app).get('/api/wastes/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Waste not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Waste, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).get('/api/wastes/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para actualizar un Waste
    describe('PUT /api/wastes/:id', () => {
        it('Debería actualizar un Waste correctamente', async () => {
            const wasteMock = {
                id: 1,
                waste_type_id: 1,
                is_recyclable: true,
                average_weight: 10,
                dataValues: { is_recyclable: true, average_weight: 10 },
                update: sinon.stub().resolves(),
                save: sinon.stub().resolves() // Simular el método save
            };

            const wasteTypeMock = { id: 1, type_name: 'Plastic' };

            // Simular `findByPk` para devolver el Waste existente
            sinon.stub(Waste, 'findByPk').resolves(wasteMock);
            sinon.stub(WasteType, 'findByPk').resolves(wasteTypeMock); // Simulamos la búsqueda del WasteType

            wasteMock.update.callsFake(async (newData) => {
                Object.assign(wasteMock, newData); // Actualizamos los datos
            });

            const res = await request(app)
                .put('/api/wastes/1')
                .send({ is_recyclable: false, average_weight: 5 });

            expect(res.status).to.equal(200);
            expect(res.body.data.is_recyclable).to.equal(false);
            expect(res.body.data.average_weight).to.equal(5);
        });

        it('Debería devolver un error 404 si el Waste no existe', async () => {
            sinon.stub(Waste, 'findByPk').resolves(null);

            const res = await request(app)
                .put('/api/wastes/1')
                .send({ is_recyclable: false });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Waste not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Waste, 'findByPk').throws(new Error('Database error'));

            const res = await request(app)
                .put('/api/wastes/1')
                .send({ is_recyclable: false });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para eliminar un Waste
    describe('DELETE /api/wastes/:id', () => {
        it('Debería eliminar un Waste correctamente', async () => {
            const wasteMock = { id: 1, is_recyclable: true, destroy: sinon.stub().resolves() };
            sinon.stub(Waste, 'findByPk').resolves(wasteMock);

            const res = await request(app).delete('/api/wastes/1');

            expect(res.status).to.equal(204);
        });

        it('Debería devolver un error 404 si el Waste no existe', async () => {
            sinon.stub(Waste, 'findByPk').resolves(null);

            const res = await request(app).delete('/api/wastes/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Waste not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Waste, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).delete('/api/wastes/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });
});
