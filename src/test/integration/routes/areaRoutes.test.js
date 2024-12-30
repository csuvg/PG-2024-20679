// test/integration/routes/areaRoutes.test.js
const chai = require('chai');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');
const areaRoutes = require('../../../routes/areaRoutes');
const Area = require('../../../models/Area');
const AuditLog = require('../../../models/AuditLog'); // Importamos el modelo de auditoría
const { expect } = chai;

describe('Area Routes', () => {
    let app;

    beforeEach(() => {
        app = express();
        app.use(express.json());

        // Incluir las rutas de área
        app.use('/api/areas', (req, res, next) => {
            req.user = { id: 999 };  // Simula el usuario autenticado
            next();
        }, areaRoutes);

        // Simulamos las funciones de Sequelize y auditoría
        sinon.stub(AuditLog, 'create').resolves(); // Simula la función de auditoría
    });

    afterEach(() => {
        sinon.restore(); // Restaurar todos los mocks/stubs
    });

    // Prueba para crear un área
    describe('POST /api/areas', () => {
        it('Debería crear un área correctamente', async () => {
            const areaMock = { id: 1, city: 'Guatemala', area: 100 };

            // Simulamos la función de Sequelize `create`
            sinon.stub(Area, 'create').resolves(areaMock);

            const res = await request(app)
                .post('/api/areas')
                .send({
                    city: 'Guatemala',
                    area: 100
                });

            expect(res.status).to.equal(201);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(areaMock);
        });

        it('Debería devolver un error 400 si faltan campos requeridos', async () => {
            const res = await request(app)
                .post('/api/areas')
                .send({ city: 'Guatemala' });  // Falta el campo "area"

            expect(res.status).to.equal(400);
            expect(res.body.error).to.equal('Invalid input data');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            // Simulamos un error en la creación del área
            sinon.stub(Area, 'create').throws(new Error('Database error'));

            const res = await request(app)
                .post('/api/areas')
                .send({
                    city: 'Guatemala',
                    area: 100
                });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para obtener un área por su ID
    describe('GET /api/areas/:id', () => {
        it('Debería devolver un área por su ID', async () => {
            const areaMock = { id: 1, city: 'Guatemala', area: 100 };
            sinon.stub(Area, 'findByPk').resolves(areaMock);

            const res = await request(app).get('/api/areas/1');

            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data).to.deep.equal(areaMock);
        });

        it('Debería devolver un error 404 si el área no existe', async () => {
            sinon.stub(Area, 'findByPk').resolves(null);  // Simular que no existe

            const res = await request(app).get('/api/areas/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Area not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Area, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).get('/api/areas/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para actualizar un área por su ID
    describe('PUT /api/areas/:id', () => {
        it('Debería actualizar un área correctamente', async () => {
            // Crear un mock que incluya `update`
            const areaMock = {
                id: 1,
                city: 'Guatemala',
                area: 100,
                dataValues: { city: 'Guatemala', area: 100 },
                update: sinon.stub().resolves() // Simular el método `update` en el mock
            };
    
            // Simular `findByPk` para devolver el área existente
            sinon.stub(Area, 'findByPk').resolves(areaMock);
    
            // Simular que `update` modifica el objeto
            areaMock.update.callsFake(async (newData) => {
                Object.assign(areaMock, newData); // Actualizamos el objeto con los nuevos datos
                Object.assign(areaMock.dataValues, newData); // Actualizamos también `dataValues`
            });
    
            const res = await request(app)
                .put('/api/areas/1')
                .send({ city: 'Guatemala', area: 150 });
    
            expect(res.status).to.equal(200);
            expect(res.body.success).to.be.true;
            expect(res.body.data.area).to.equal(150);  // Verificar que el valor de `area` se actualizó a 150
        });

        it('Debería devolver un error 404 si el área no existe', async () => {
            sinon.stub(Area, 'findByPk').resolves(null);

            const res = await request(app).put('/api/areas/1').send({ city: 'Guatemala', area: 150 });

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Area not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Area, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).put('/api/areas/1').send({ city: 'Guatemala', area: 150 });

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });

    // Prueba para eliminar un área por su ID
    describe('DELETE /api/areas/:id', () => {
        it('Debería eliminar un área correctamente', async () => {
            const areaMock = { id: 1, city: 'Guatemala', area: 100, destroy: sinon.stub().resolves() };
            sinon.stub(Area, 'findByPk').resolves(areaMock);

            const res = await request(app).delete('/api/areas/1');

            expect(res.status).to.equal(204);
        });

        it('Debería devolver un error 404 si el área no existe', async () => {
            sinon.stub(Area, 'findByPk').resolves(null);

            const res = await request(app).delete('/api/areas/1');

            expect(res.status).to.equal(404);
            expect(res.body.error).to.equal('Area not found');
        });

        it('Debería devolver un error 500 si ocurre un problema en el servidor', async () => {
            sinon.stub(Area, 'findByPk').throws(new Error('Database error'));

            const res = await request(app).delete('/api/areas/1');

            expect(res.status).to.equal(500);
            expect(res.body.error).to.equal('Internal Server Error');
        });
    });
});
