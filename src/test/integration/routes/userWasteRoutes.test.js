// test/integration/routes/userWasteRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const userWasteRoutes = require('../../../routes/userWasteRoutes');
const UserWaste = require('../../../models/UserWaste');
const User = require('../../../models/User');
const Waste = require('../../../models/Waste');
const Location = require('../../../models/Location');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const { expect } = chai;

describe('UserWaste Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Simula el usuario autenticado
        app.use('/api/user-wastes', (req, res, next) => {
            req.user = { id: 999 };  // Simula el ID de usuario
            next();
        }, userWasteRoutes);

        // Simulamos las funciones de Sequelize y auditoría
        sinon.stub(AuditLog, 'create').resolves(); // Simula la función de auditoría
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para crear un UserWaste
    describe('POST /api/user-wastes', () => {
        it('Debería crear un UserWaste correctamente (medido en peso)', async () => {
            const userWasteMock = { id: 1, user_id: 999, waste_id: 1, name: 'Plastic Waste', weight: 10 };

            // Simulamos la creación de un UserWaste
            sinon.stub(UserWaste, 'create').resolves(userWasteMock);
            sinon.stub(User, 'findByPk').resolves({ id: 999 });
            sinon.stub(Waste, 'findByPk').resolves({ id: 1 });
            sinon.stub(Location, 'findByPk').resolves({ id: 1 });

            const res = await request(app)
                .post('/api/user-wastes')
                .send({
                    user_id: 999,
                    waste_id: 1,
                    name: 'Plastic Waste',
                    measure_unit: 10,  // La unidad ya fue convertida a kilogramos en el backend
                    measure_type: 'weight',
                    weight_unit: 'kg',
                    datetime: new Date(),
                    location_id: 1
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.deep.equal(userWasteMock);
        });

        it('Debería crear un UserWaste correctamente (medido en unidades)', async () => {
            const userWasteMock = { id: 1, user_id: 999, waste_id: 1, name: 'Plastic Waste', weight: 50 };

            // Simulamos la creación de un UserWaste
            sinon.stub(UserWaste, 'create').resolves(userWasteMock);
            sinon.stub(User, 'findByPk').resolves({ id: 999 });
            sinon.stub(Waste, 'findByPk').resolves({ id: 1, average_weight: 5 });
            sinon.stub(Location, 'findByPk').resolves({ id: 1 });

            const res = await request(app)
                .post('/api/user-wastes')
                .send({
                    user_id: 999,
                    waste_id: 1,
                    name: 'Plastic Waste',
                    measure_unit: 10,  // Unidades, se multiplica por average_weight
                    measure_type: 'unit',
                    datetime: new Date(),
                    location_id: 1
                });

            expect(res.status).to.equal(201);
            expect(res.body).to.deep.equal(userWasteMock);
        });

        it('Debería devolver un error 404 si el usuario no existe', async () => {
            sinon.stub(User, 'findByPk').resolves(null);

            const res = await request(app)
                .post('/api/user-wastes')
                .send({
                    user_id: 999,
                    waste_id: 1,
                    name: 'Plastic Waste',
                    measure_unit: 10,  // Unidad ya convertida
                    measure_type: 'weight',
                    datetime: new Date(),
                    location_id: 1
                });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('User not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(User, 'findByPk').throws(new Error('Database error'));

            const res = await request(app)
                .post('/api/user-wastes')
                .send({
                    user_id: 999,
                    waste_id: 1,
                    name: 'Plastic Waste',
                    measure_unit: 10,  // Unidad ya convertida
                    measure_type: 'weight',
                    datetime: new Date(),
                    location_id: 1
                });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener un UserWaste por su ID
    describe('GET /api/user-wastes/:id', () => {
        it('Debería devolver un UserWaste por su ID', async () => {
            const userWasteMock = { id: 1, user_id: 999, waste_id: 1, name: 'Plastic Waste', weight: 10 };
            sinon.stub(UserWaste, 'findByPk').resolves(userWasteMock);

            const res = await request(app).get('/api/user-wastes/1');

            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(userWasteMock);
        });

        it('Debería devolver un error 404 si el UserWaste no existe', async () => {
            sinon.stub(UserWaste, 'findByPk').resolves(null);

            const res = await request(app).get('/api/user-wastes/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('UserWaste not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(UserWaste, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).get('/api/user-wastes/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener todos los UserWastes
    describe('GET /api/user-wastes', () => {
        it('Debería devolver todos los UserWastes', async () => {
            const userWastesMock = [
                { id: 1, user_id: 999, waste_id: 1, name: 'Plastic Waste', weight: 10 },
                { id: 2, user_id: 999, waste_id: 2, name: 'Glass Waste', weight: 5 }
            ];
            sinon.stub(UserWaste, 'findAll').resolves(userWastesMock);

            const res = await request(app).get('/api/user-wastes');

            expect(res.status).to.equal(200);
            expect(res.body).to.deep.equal(userWastesMock);
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(UserWaste, 'findAll').throws(new Error('Database error'));

            const res = await request(app).get('/api/user-wastes');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para actualizar un UserWaste
    describe('PUT /api/user-wastes/:id', () => {
        it('Debería actualizar un UserWaste correctamente', async () => {
            const userWasteMock = {
                id: 1,
                user_id: 999,
                waste_id: 1,
                name: 'Plastic Waste',
                weight: 10,
                dataValues: { name: 'Plastic Waste', weight: 10 },
                update: sinon.stub().resolves(),
                save: sinon.stub().resolves() // Simular el método save
            };
    
            const wasteMock = { id: 1, average_weight: 5 };
    
            // Simular `findByPk` para devolver el UserWaste existente
            sinon.stub(UserWaste, 'findByPk').resolves(userWasteMock);
            sinon.stub(Waste, 'findByPk').resolves(wasteMock); // Simulamos la búsqueda del waste
    
            const res = await request(app)
                .put('/api/user-wastes/1')
                .send({ measure_unit: 15, measure_type: 'weight' , weight_unit: 'kg'}); // Actualización de la medida
    
            expect(res.status).to.equal(200);
            expect(res.body.weight).to.equal(15);  // Debe reflejar la conversión de la medida a kg
        });

        it('Debería devolver un error 404 si el UserWaste no existe', async () => {
            sinon.stub(UserWaste, 'findByPk').resolves(null);

            const res = await request(app).put('/api/user-wastes/1').send({ name: 'Updated Waste', measure_unit: 15 });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('UserWaste not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(UserWaste, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).put('/api/user-wastes/1').send({ name: 'Updated Waste', measure_unit: 15 });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para eliminar un UserWaste
    describe('DELETE /api/user-wastes/:id', () => {
        it('Debería eliminar un UserWaste correctamente', async () => {
            const userWasteMock = { id: 1, name: 'Plastic Waste', destroy: sinon.stub().resolves() };
            sinon.stub(UserWaste, 'findByPk').resolves(userWasteMock);

            const res = await request(app).delete('/api/user-wastes/1');

            expect(res.status).to.equal(204);
        });

        it('Debería devolver un error 404 si el UserWaste no existe', async () => {
            sinon.stub(UserWaste, 'findByPk').resolves(null);

            const res = await request(app).delete('/api/user-wastes/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('UserWaste not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(UserWaste, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).delete('/api/user-wastes/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });
});
